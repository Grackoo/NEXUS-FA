function doGet(e) {
  try {
    var action = e.parameter.action;
    var clientId = e.parameter.clientId;

    if (action === 'getPortfolio' && clientId) {
      var data = getPortfolioData(clientId);
      return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ error: 'Acción no válida o clientId faltante' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// FUNCIÓN PARA ESCRIBIR DATOS (POST)
// ==========================================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // ==========================================
    // NUEVO: CASO PARA AGREGAR NUEVO CLIENTE
    // ==========================================
    if (data.type === 'AddClient') {
      var newClientSheet = spreadsheet.getSheetByName('CLIENTES-DATA'); 
      
      if (!newClientSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Hoja CLIENTES-DATA no encontrada' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Añadir la fila con el orden exacto: ID, NOMBRE, ROLE, PASSWORD, EMAIL, TELEFONO, PERFIL_RIESGO
      newClientSheet.appendRow([
        data.ID || '',
        data.Nombre || '',
        data.Role || 'client',
        data.Password || '',
        data.Email || '',
        data.Telefono || '',
        data.Perfil_Riesgo || 'Moderado' // <-- AQUÍ ESTÁ EL NUEVO CAMPO AÑADIDO
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Cliente agregado correctamente' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    // ==========================================
    
    // ==========================================
    // CASO PARA ACTUALIZAR EXPEDIENTE KYC
    // ==========================================
    if (data.type === 'UpdateKYC') {
      var clientSheet = spreadsheet.getSheetByName('CLIENTES'); // Cambia 'CLIENTES' si tu pestaña se llama distinto
      
      if (!clientSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Hoja de clientes no encontrada' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var values = clientSheet.getDataRange().getValues();
      var headers = values[0];
      
      var idCol = headers.indexOf('ID');
      var horizonCol = headers.indexOf('Horizonte_Inversion');
      var liquidityCol = headers.indexOf('Necesidades_Liquidez');
      var communicationCol = headers.indexOf('Ultima_Comunicacion');
      
      var rowIndex = -1;
      for (var i = 1; i < values.length; i++) {
        if (values[i][idCol] == data.clientId) {
          rowIndex = i + 1; // +1 porque Apps Script empieza en fila 1
          break;
        }
      }
      
      if (rowIndex !== -1) {
        if (horizonCol !== -1) clientSheet.getRange(rowIndex, horizonCol + 1).setValue(data.investmentHorizon || '');
        if (liquidityCol !== -1) clientSheet.getRange(rowIndex, liquidityCol + 1).setValue(data.liquidityNeeds || '');
        if (communicationCol !== -1) clientSheet.getRange(rowIndex, communicationCol + 1).setValue(data.lastCommunication || '');
        
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: "KYC actualizado" }))
               .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Cliente no encontrado" }))
               .setMimeType(ContentService.MimeType.JSON);
      }
    }
    // ==========================================
    // FIN DEL CASO KYC
    // ==========================================

    // ==========================================
    // CASO PARA ACTUALIZAR PERFIL DE RIESGO
    // ==========================================
    if (data.type === 'UpdateRiskProfile') {
      var clientSheet = spreadsheet.getSheetByName('CLIENTES-DATA'); 
      if (!clientSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Hoja CLIENTES-DATA no encontrada' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var values = clientSheet.getDataRange().getValues();
      var headers = values[0];
      
      var idCol = headers.indexOf('ID');
      var riskCol = headers.indexOf('PERFIL_RIESGO');
      if (riskCol === -1) riskCol = headers.indexOf('Perfil_Riesgo');
      
      var rowIndex = -1;
      for (var i = 1; i < values.length; i++) {
        if (values[i][idCol] == data.clientId) {
          rowIndex = i + 1; // +1 porque Apps Script empieza en fila 1
          break;
        }
      }
      
      if (rowIndex !== -1 && riskCol !== -1) {
        clientSheet.getRange(rowIndex, riskCol + 1).setValue(data.riskProfile || 'Moderado');
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Perfil de riesgo actualizado" }))
               .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Cliente o columna de perfil no encontrados" }))
               .setMimeType(ContentService.MimeType.JSON);
      }
    }
    // ==========================================

    var gids = {
      operaciones: '418925467' // GID de la hoja de OPERACIONES
    };
    
    var opsSheet = getSheetByGid(spreadsheet, gids.operaciones);
    if (!opsSheet) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Hoja de operaciones no encontrada' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Si es para eliminar posiciones (Ej. cuando se edita o sobrescribe)
    if (data.type === 'Delete' || data.Tipo_Operacion === 'Delete') {
      var sheetData = opsSheet.getDataRange().getValues();
      var headers = sheetData[0];
      
      var clientIdIdx = headers.indexOf('Cliente_ID') > -1 ? headers.indexOf('Cliente_ID') : headers.indexOf('ClientID');
      var tickerIdx = headers.indexOf('Ticker') > -1 ? headers.indexOf('Ticker') : headers.indexOf('Symbol');
      var assetTypeIdx = headers.indexOf('Tipo_Activo') > -1 ? headers.indexOf('Tipo_Activo') : headers.indexOf('AssetType');
      
      // Borrar de abajo hacia arriba para no desfasar los índices
      var deleted = false;
      for (var i = sheetData.length - 1; i > 0; i--) {
        var row = sheetData[i];
        if (row[clientIdIdx] == data.clientId && row[tickerIdx] == data.ticker && row[assetTypeIdx] == data.assetType) {
          opsSheet.deleteRow(i + 1);
          deleted = true;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: deleted }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Si es para agregar una nueva operación
    var headers = opsSheet.getDataRange().getValues()[0];
    var newRow = [];
    
    for (var i = 0; i < headers.length; i++) {
      var h = headers[i] ? headers[i].toString().trim() : '';
      if (h === 'Fecha' || h === 'Date') newRow.push(data.date || '');
      else if (h === 'Cliente_ID' || h === 'ClientID') newRow.push(data.clientId || data.Cliente_ID || '');
      else if (h === 'Tipo_Operación' || h === 'Type' || h === 'Tipo_Operacion') newRow.push(data.Tipo_Operacion || data.type || '');
      else if (h === 'Ticker' || h === 'Symbol') newRow.push(data.ticker || data.Ticker || '');
      else if (h === 'Tipo_Activo' || h === 'AssetType') newRow.push(data.assetType || data.Tipo_Activo || '');
      else if (h === 'Cantidad' || h === 'Shares') newRow.push(data.shares !== undefined ? data.shares : (data.Cantidad !== undefined ? data.Cantidad : ''));
      else if (h === 'Precio' || h === 'Price') newRow.push(data.price !== undefined ? data.price : (data.Precio !== undefined ? data.Precio : ''));
      else if (h === 'Comisión' || h === 'Comision') newRow.push(data.commission !== undefined ? data.commission : (data.Comision !== undefined ? data.Comision : ''));
      else if (h === 'Moneda' || h === 'Currency') newRow.push(data.originalCurrency || data.Moneda || data.currency || '');
      else if (h === 'Total_MXN') newRow.push(data.Total_MXN !== undefined ? data.Total_MXN : '');
      else newRow.push(''); // Campos no reconocidos se dejan vacíos
    }
    
    opsSheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// FUNCIONES DE APOYO Y LECTURA (GET)
// ==========================================

function getSheetByGid(spreadsheet, gid) {
  var sheets = spreadsheet.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId().toString() === gid.toString()) {
      return sheets[i];
    }
  }
  return null;
}

function getPortfolioData(clientId) {
  // Accede a la hoja activa vinculada al script
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(); 

  // Configuración de GIDs
  var gids = {
    operaciones: '418925467', // OPERACIONES
    currency: '1688734912',   // CURRENCY_TRACKER (Opcional si usas tipo de cambio)
    categorias: [
      '96904810',  // PORTFOLIO_SUMMARY
      '1142203439', // SUMMARY_STOCKS
      '643930586',  // SUMMARY_ETFS
      '230075770',  // SUMMARY_CRYPTO
      '810681393',  // SUMMARY_FIXED_INCOME
      '831142110',  // SUMMARY_FIBRAS
      '456974640',  // SUMMARY_COMMODITIES
      '1831667518'  // SUMMARY_FOREX
    ]
  };

  var portfolio = [];
  var operations = [];
  
  // 1. Procesar Operaciones
  var opsSheet = getSheetByGid(spreadsheet, gids.operaciones);
  if (opsSheet) {
    var data = opsSheet.getDataRange().getValues();
    if (data.length > 0) {
      var headers = data[0];
      for (var i = 1; i < data.length; i++) {
        var rowObj = createObjectFromRow(headers, data[i]);
        var rowClientId = rowObj.Cliente_ID || rowObj.ClientID || '';
        
        if (rowClientId.toString().toLowerCase() === clientId.toLowerCase()) {
          operations.push({
            date: rowObj.Fecha || rowObj.Date || '',
            clientId: rowClientId.toString(),
            type: rowObj['Tipo_Operación'] || rowObj.Type || '',
            ticker: rowObj.Ticker || rowObj.Symbol || '',
            assetType: rowObj.Tipo_Activo || rowObj.AssetType || '',
            shares: safeParseFloat(rowObj.Cantidad || rowObj.Shares),
            price: safeParseFloat(rowObj.Precio || rowObj.Price),
            commission: safeParseFloat(rowObj['Comisión'] || rowObj.Comision),
            currency: rowObj.Moneda || rowObj.Currency || 'USD',
            totalMXN: safeParseFloat(rowObj.Total_MXN)
          });
        }
      }
    }
  }

  // Mapeo de categorías
  var typeMapping = {
    'stocks': 'Renta Variable', 'acciones': 'Renta Variable', 'etfs': 'Renta Variable',
    'fibras': 'Renta Variable', 'fibra': 'Renta Variable', 'commodities': 'Renta Variable',
    'renta fija': 'Renta Fija', 'cetes': 'Renta Fija',
    'crypto': 'Criptomonedas', 'cripto': 'Criptomonedas', 'criptomonedas': 'Criptomonedas',
    'forex': 'Divisas', 'divisas': 'Divisas', 'cash': 'Divisas', 'liquidez': 'Divisas'
  };

  // 2. Procesar Portafolio
  for (var j = 0; j < gids.categorias.length; j++) {
    var catSheet = getSheetByGid(spreadsheet, gids.categorias[j]);
    if (catSheet) {
      var data = catSheet.getDataRange().getValues();
      if (data.length > 0) {
        var headers = data[0];
        for (var i = 1; i < data.length; i++) {
          var rowObj = createObjectFromRow(headers, data[i]);
          var rowClientId = rowObj.ClientID || rowObj.clientid || rowObj.ID || rowObj.id;
          
          if (rowClientId && rowClientId.toString().toLowerCase() === clientId.toLowerCase()) {
            var rawType = rowObj.Type || rowObj.Tipo || rowObj.Category || rowObj.AssetType || '';
            var typeKey = rawType.toString().toLowerCase();
            var mappedType = typeMapping[typeKey] || 'Renta Variable';
            var shares = safeParseFloat(rowObj.Shares_Owned || rowObj.Shares || rowObj.Titulos || rowObj.Cantidad);
            var ticker = rowObj.Ticker || rowObj.Symbol || rowObj.Activo || '';
            
            if (ticker && shares > 0) {
              portfolio.push({
                ticker: ticker,
                type: mappedType,
                sharesOwned: shares,
                avgPurchasePriceMXN: safeParseFloat(rowObj.Avg_Price_MXN || rowObj.Costo_MXN || rowObj.Precio_Promedio_MXN),
                avgPurchasePriceUSD: safeParseFloat(rowObj.Avg_Price_USD || rowObj.Costo_USD || rowObj.Precio_Promedio_USD),
                realTimePrice: safeParseFloat(rowObj.Live_Price || rowObj.Real_Time_Price || rowObj.Precio_Mercado || rowObj.Price),
                nativeCurrency: rowObj.Currency || rowObj.Moneda || rowObj.Divisa || 'USD',
                logoUrl: rowObj.LogoURL || rowObj.Logo_URL || rowObj.Logo || ''
              });
            }
          }
        }
      }
    }
  }

  // 3. Calcular Totales
  var netWorthMXN = 0;
  // Obtendremos un tipo de cambio simulado o estático aquí, o puedes calcularlo dinámicamente.
  // Es mejor calcular estos totales usando el precio en tiempo real del API/Hoja
  var exchangeRate = 18.0; 
  
  // Si deseas, intenta leer el USD de CURRENCY_TRACKER
  var currencySheet = getSheetByGid(spreadsheet, gids.currency);
  if (currencySheet) {
      var cData = currencySheet.getDataRange().getValues();
      for(var c = 1; c < cData.length; c++) {
          var tickerCurrency = (cData[c][0] || '').toString().toUpperCase();
          if(tickerCurrency.includes('USD') || tickerCurrency === 'USD/MXN') {
             exchangeRate = safeParseFloat(cData[c][1]) || exchangeRate; 
          }
      }
  }

  for (var k = 0; k < portfolio.length; k++) {
    var asset = portfolio[k];
    var currentPriceMXN = asset.nativeCurrency === 'USD' ? (asset.realTimePrice * exchangeRate) : asset.realTimePrice;
    netWorthMXN += (asset.sharesOwned * currentPriceMXN);
  }
  
  var netWorthUSD = netWorthMXN / exchangeRate;

  return {
    portfolio: portfolio,
    operations: operations,
    totals: {
      netWorthMXN: netWorthMXN,
      netWorthUSD: netWorthUSD
    }
  };
}

// Funciones de Ayuda
function createObjectFromRow(headers, row) {
  var obj = {};
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    if (header) {
      obj[header.toString().trim()] = row[i];
    }
  }
  return obj;
}

function safeParseFloat(val) {
  if (val === undefined || val === null) return 0;
  var cleaned = val.toString().replace(/[^0-9.-]+/g, '');
  var parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
