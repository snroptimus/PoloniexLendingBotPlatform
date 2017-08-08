// vim: ts=4:sw=4:et

var localFile, reader;

var Hour = new Timespan("Hour", 1/24);
var Day = new Timespan("Day", 1);
var Week = new Timespan("Week", 7);
var Month = new Timespan("Month", 30);
var Year = new Timespan("Year", 365);
var refreshRate = 30;
var timespans = [];
var summaryCoinRate, summaryCoin;
var earningsOutputCoinRate, earningsOutputCoin;
var outputCurrencyDisplayMode = 'all'
var validOutputCurrencyDisplayModes = ['all', 'summary'];
var effRateMode = 'lentperc';
var validEffRateModes = ['lentperc', 'onlyfee'];

// BTC DisplayUnit
var BTC = new BTCDisplayUnit("BTC", 1);
var mBTC = new BTCDisplayUnit("mBTC", 1000);
var Bits = new BTCDisplayUnit("Bits", 1000000);
var Satoshi = new BTCDisplayUnit("Satoshi", 100000000);
var displayUnit = BTC;
var btcDisplayUnitsModes = [BTC, mBTC, Bits, Satoshi];

var botStatus = false;

function updateJson(data) {
    $('#status').text(data.last_status);
    $('#updated').text(data.last_update);

    var rowCount = data.log.length;
    var table = $('#logtable');
    table.empty();
    for (var i = rowCount - 1; i >=0; i--) {
        table.append($('<tr/>').append($('<td colspan="2" />').text(data.log[i])));
    }

    updateOutputCurrency(data.outputCurrency);
}

function updateOutputCurrency(outputCurrency){
    var OutCurr = Object.keys(outputCurrency);
    summaryCoin = outputCurrency['currency'];
    summaryCoinRate = parseFloat(outputCurrency['highestBid']);
    // switch between using outputCoin for summary only or all lending coins earnings
    if(outputCurrencyDisplayMode == 'all') {
        earningsOutputCoin = summaryCoin;
        earningsOutputCoinRate = summaryCoinRate;
    } else {
        earningsOutputCoin = 'BTC'
        earningsOutputCoinRate = 1;
    }
}

// prints a pretty float with accuracy.
// above zero accuracy will be used for float precision
// below zero accuracy will indicate precision after must significat digit
// strips trailing zeros
function prettyFloat(value, accuracy) {
    var precision = Math.round(Math.log10(value));
    var result = precision < 0 ? value.toFixed(Math.min((accuracy - precision), 8)) : value.toFixed(accuracy);
    return isNaN(result) ? '0' : result.replace(/(?:\.0+|(\.\d+?)0+)$/, '$1');
}

function printFloat(value, precision) {
    var multiplier = Math.pow(10, precision);
    var result = Math.round(value * multiplier) / multiplier;
    return result = isNaN(result) ? '0' : result.toFixed(precision);
}

function handleLocalFile(file) {
    localFile = file;
    reader = new FileReader();
    reader.onload = function(e) {
        updateJson(JSON.parse(reader.result));
    };
    reader.readAsText(localFile, 'utf-8');
}

function loadBotInfo() {
    var csrftoken = getCookie('csrftoken');

    $.ajax(
    {
        type: "GET",
        url: "/botInfo" ,
//        data: {stuff_for_python: document.getElementById("Uname").value},
        data: {
            'username': getCookie('username'),
            'csrfmiddlewaretoken' : csrftoken,
        },
        success: function(response)
        {
            console.log(response);
            $('#API').val(response.apikey);
            $('#Secret').val(response.secret);
            $('#rate').val(response.minRate);
            $('#rateLonger').val(response.minRateLonger);
            $('#duration').val(response.duration);

            botStatus = response.botStatus;
            console.log(botStatus);
            if ( botStatus == false ) {
                $('#botToggle').html('Activate Bot');
                $("#botToggle").css("background-color","Green");
            }
            else {
                $('#botToggle').html('Deactivate Bot');
                $("#botToggle").css("background-color", '#CC0000');
            }
        },
        error: function(data)
        {
        },
    });
}

function movingAverageFilter(data) {
    var rawData = [];
    var rowCount = data.length;

    console.log(data);
    for ( var i = 1; i < rowCount; i++ ) {
        rawData[i - 1] = data[i].value - data[i-1].value;
    }
    console.log("RAW");
    console.log(rawData);
    var filterData = [];
    var dataCount = rawData.length;
    for ( var i = 0; i < dataCount; i++ ) {
        var sampleCount = 0;
        var sampleSum = 0;
        for ( var j = i; i - j < 60; j -- ) {
            sampleCount ++;
            sampleSum += rawData[j];
            if ( j == 0 )
                break;
        }
        filterData[i] = sampleSum / sampleCount;
    }
    console.log(filterData);
    return filterData;
}

function updateChartData(data) {
    var rowCount = data.length;
    var tempData = [];
    var tempData1 = [];
    

    var filterData = movingAverageFilter(data);
    
    for ( var i = 1; i < rowCount - 1; i ++ ) {
        var firstDate = new Date(data[i].date);
        tempData.push( {
            "date": firstDate,
            "volume": data[i].value,
            "value": data[i].value - data[i-1].value, 
        });
    }

    chartData = tempData;

    var filterData = movingAverageFilter(data);
    
    for ( var i = 0; i < filterData.length - 1; i ++ ) {
        var firstDate = new Date(data[i].date);
        tempData1.push( {
            "date": firstDate,
            "value": filterData[i],
            "volume": 0
        });
    }
    chartVelocityData = tempData1;
    
    drawChart();
    drawVelocityChart();
}

function loadData() {
/*    if (localFile) {
        reader.readAsText(localFile, 'utf-8');
        setTimeout('loadData()', refreshRate * 1000)
    } else {
        // expect the botlog.json to be in the same folder on the webserver
        var file = 'botlog.json';
        $.getJSON(file, function (data) {
            updateJson(data);
            // reload every 30sec
            setTimeout('loadData()', refreshRate * 1000)
        }).fail( function(d, textStatus, error) {
            $('#status').text("getJSON failed, status: " + textStatus + ", error: "+error);
            // retry after 60sec
            setTimeout('loadData()', 60000)
        });;
    }*/

    var csrftoken = getCookie('csrftoken');
    $.ajax(
    {
        type: "GET",
        url: "/speedTest" ,
//        data: {stuff_for_python: document.getElementById("Uname").value},
        data: {
            'username': getCookie('username'),
            'csrfmiddlewaretoken' : csrftoken,
        },
        success: function(response)
        {
            console.log(response);
            updateChartData(response['chartData']);
            setTimeout('loadData()', refreshRate * 1000)
        },
        error: function(data)
        {
        },
    });
}

function Timespan(name, multiplier) {
    this.name = name;
    this.multiplier = multiplier;
    this.calcEarnings = function(sum, rate) {
        return sum * Math.pow(1 + rate, multiplier) - sum;
    };
    this.formatEarnings = function(currency, earnings, minimize_currency_xs) {
        if (currency == "BTC" && this == Hour) {
            return printFloat(earnings * 100000000, 0) + " Satoshi / " + name + "<br/>";
        } else {
            var currencyClass = '';
            if (minimize_currency_xs) {
                currencyClass = 'hidden-xs';
            }
            if (currency == "BTC") {
                return displayUnit.formatValue(earnings) + " <span class=" + currencyClass + ">" + displayUnit.name + "</span> / " + name + "<br/>"
            } else if (currency == "USD" || currency == "USDT" || currency == "EUR") {
                return prettyFloat(earnings, 2) + " <span class=" + currencyClass + ">" + currency + "</span> / "+  name + "<br/>";
            } else {
                return printFloat(earnings, 8) + " <span class=" + currencyClass + ">" + currency + "</span> / "+  name + "<br/>";
            }
        }
    };
}

function BTCDisplayUnit(name, multiplier) {
    this.name = name;
    this.multiplier = multiplier;
    this.precision = Math.log10(multiplier);
    this.formatValue = function(value) {
        return printFloat(value * this.multiplier, 8 - this.precision);
    }
}

function setEffRateMode() {
    var q = location.search.match(/[\?&]effrate=[^&]+/);

    if (q) {
        //console.log('Got effective rate mode from URI');
        effRateMode = q[0].split('=')[1];
    } else {
        if (localStorage.effRateMode) {
            //console.log('Got effective rate mode from localStorage');
            effRateMode = localStorage.effRateMode;
        }
    }
    if (validEffRateModes.indexOf(effRateMode) == -1) {
        console.error(effRateMode + ' is not valid effective rate mode! Valid values are ' + validModes);
        effRateMode = validEffRateModes[0];
    }
    localStorage.effRateMode = effRateMode;
    $("input[name='effRateMode'][value='"+ effRateMode +"']").prop('checked', true);;
    console.log('Effective rate mode: ' + effRateMode);
}

function setBTCDisplayUnit() {
    var q = location.search.match(/[\?&]displayUnit=[^&]+/);
    var displayUnitText = 'BTC';

    if (q) {
        //console.log('Got displayUnitText from URI');
        displayUnitText = q[0].split('=')[1];
    } else {
        if (localStorage.displayUnitText) {
            //console.log('Got displayUnitText from localStorage');
            displayUnitText = localStorage.displayUnitText;
        }
    }

    $("input[name='btcDisplayUnit'][value='"+ displayUnitText +"']").prop('checked', true);;

    btcDisplayUnitsModes.forEach(function(unit) {
        if(unit.name == displayUnitText) {
            displayUnit = unit;
            localStorage.displayUnitText = displayUnitText;
        }
    })
    console.log('displayUnitText: ' + displayUnitText);
}

function setOutputCurrencyDisplayMode() {
    var q = location.search.match(/[\?&]earningsInOutputCurrency=[^&]+/);
    var outputCurrencyDisplayModeText = 'all';

    if (q) {
        outputCurrencyDisplayModeText = q[0].split('=')[1];
    } else {
        if (localStorage.outputCurrencyDisplayModeText) {
            outputCurrencyDisplayModeText = localStorage.outputCurrencyDisplayModeText;
        }
    }

    $("input[name='outputCurrencyDisplayMode'][value='"+ outputCurrencyDisplayModeText +"']").prop('checked', true);;

    validOutputCurrencyDisplayModes.forEach(function(mode) {
        if(mode == outputCurrencyDisplayModeText) {
            outputCurrencyDisplayMode = mode;
            localStorage.outputCurrencyDisplayModeText = outputCurrencyDisplayModeText;
        }
    })
    console.log('outputCurrencyDisplayMode: ' + outputCurrencyDisplayModeText);

}

function loadSettings() {
    // Refresh rate
    refreshRate = localStorage.getItem('refreshRate') || 30
    $('#refresh_interval').val(refreshRate)

    // Time spans
    var timespanNames = JSON.parse(localStorage.getItem('timespanNames')) || ["Year", "Month", "Week", "Day", "Hour"]

    timespans = [Year, Month, Week, Day, Hour].filter(function(t) {
        // filters out timespans not specified
        return timespanNames.indexOf(t.name) !== -1;
    });

    timespanNames.forEach(function(t) {
        $('input[data-timespan="' + t + '"]').prop('checked', true);
    });
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function doSetParam() {
    var csrftoken = getCookie('csrftoken');

    var minRate = $('#rate').val();
    var minRateLonger = $('#rateLonger').val();
    var duration = $('#duration').val();

    if ( minRate == "" || minRateLonger == "" || duration == "" )
        toastr.warning("Input Values Properly!");
    else {
        $.ajax(
        {
            type: "POST",
            url: "/setParam" ,
    //        data: {stuff_for_python: document.getElementById("Uname").value},
            data: {
                'minRate': minRate, 
                'minRateLonger': minRateLonger, 
                'duration':duration,
                'username': getCookie('username'),
                'csrfmiddlewaretoken' : csrftoken,
            },
            success: function(response)
            {
                console.log(response);
                toastr.success("Setting Succeeded!");
            },
            error: function(data)
            {
                toastr.error("Setting Failed!");
            },
        });
    }
    
}

function doSetKey() {
        var csrftoken = getCookie('csrftoken');

    var API = $('#API').val();
    var Secret = $('#Secret').val();

    console.log(getCookie('username'));
    if ( API == "" || Secret == "" )
        toastr.warning("Input Values Properly!");
    else {
        $.ajax(
        {
            type: "POST",
            url: "/setKey" ,
            data: {
                'API': API, 
                'Secret': Secret, 
                'csrfmiddlewaretoken' : csrftoken,
                'username': getCookie('username')
            },
            success: function(response)
            {
                console.log(response);
                toastr.success("Setting Succeeded!");
            },
            error: function(data)
            {
                toastr.error("Setting Failed!");
            },
        });
    }
}

function toggleBot() {
    if ( botStatus == true ) {
        $('#botToggle').html('Activate Bot');
        $("#botToggle").css("background-color","Green");
        botStatus = false;
        doStopBot();
    }
    else {
        botStatus = true;
        $('#botToggle').html('Deactivate Bot');
        $("#botToggle").css("background-color","#CC0000");
        doStartBot();
    }
}
function doStartBot() {
    var csrftoken = getCookie('csrftoken');

    var API = $('#API').val();
    var Secret = $('#Secret').val();

//    if ( API == "" || Secret == "" )
//        toastr.warning("Input Values Properly!");
//    else {
        $.ajax(
        {
            type: "POST",
            url: "/startBot" ,
    //        data: {stuff_for_python: document.getElementById("Uname").value},
            data: {
                'API': API, 
                'Secret': Secret, 
                'csrfmiddlewaretoken' : csrftoken,
                'username': getCookie('username')
            },
            success: function(response)
            {
                console.log(response);
                if ( response == "success")
                    toastr.success("Bot Activated!");
                else if ( response == "exist" )
                    toastr.warning("Already Activated!");
            },
            error: function(data)
            {
                toastr.error("Setting Failed!");
            },
        });
//    }
}

function doStopBot() {
        var csrftoken = getCookie('csrftoken');

    var API = $('#API').val();
    var Secret = $('#Secret').val();

//    if ( API == "" || Secret == "" )
//        toastr.warning("Input Values Properly!");
//    else {
        $.ajax(
        {
            type: "POST",
            url: "/stopBot" ,
    //        data: {stuff_for_python: document.getElementById("Uname").value},
            data: {
                'API': API, 
                'Secret': Secret, 
                'username': getCookie('username'),
                'csrfmiddlewaretoken' : csrftoken,
            },
            success: function(response)
            {
                console.log(response);
                toastr.success("Bot Deactivated!");
            },
            error: function(data)
            {
                toastr.error("Setting Failed!");
            },
        });
//    }
}

function doSave() {
    // Validation
    var tempRefreshRate = $('#refresh_interval').val()
    if(tempRefreshRate < 10 || tempRefreshRate > 60) {
        alert('Please input a value between 10 and 60 for refresh rate')
        return false
    }

    // Refresh rate
    localStorage.setItem('refreshRate', tempRefreshRate)

    // Time spans
    var timespanNames = [];
    $('input[type="checkbox"]:checked').each(function(i, c){
        timespanNames.push($(c).attr('data-timespan'));
    });
    localStorage.setItem('timespanNames', JSON.stringify(timespanNames))

    // Bitcoin Display Unit
    localStorage.displayUnitText = $('input[name="btcDisplayUnit"]:checked').val();
    btcDisplayUnitsModes.forEach(function(unit) {
        if(unit.name == localStorage.displayUnitText) {
            displayUnit = unit;
        }
    })

    // OutputCurrencyDisplayMode
    localStorage.outputCurrencyDisplayModeText = $('input[name="outputCurrencyDisplayMode"]:checked').val();
    if(validOutputCurrencyDisplayModes.indexOf(localStorage.outputCurrencyDisplayModeText) !== -1) {
        outputCurrencyDisplayMode = localStorage.outputCurrencyDisplayModeText;
    }
    
    //Effective rate calculation
    localStorage.effRateMode = $('input[name="effRateMode"]:checked').val();
    if(validEffRateModes.indexOf(localStorage.effRateMode) !== -1) {
        effRateMode = localStorage.effRateMode;
    }

    toastr.success("Settings saved!");
    $('#settings_modal').modal('hide');

    // Now we actually *use* these settings!
    update();
}

function signOut() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++ ) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    }
    
    window.location = "/";
    
}

function chart() {
    window.location = "/chart";   
}

function home() {
    window.location = "/home";
}

function update() {
    loadBotInfo();
    loadSettings();
    setEffRateMode();
    setBTCDisplayUnit();
    setOutputCurrencyDisplayMode();
    loadData();
    if (window.location.protocol == "file:") {
        $('#file').show();
    }
}

// https://github.com/twbs/bootstrap/issues/14040#issuecomment-253840676
function bsNavbarBugWorkaround() {
    var nb = $('nav.navbar-fixed-top');
    $('.modal').on('show.bs.modal', function () {
        nb.width(nb.width());
    }).on('hidden.bs.modal', function () {
        nb.width(nb.width('auto'));
    });
}

$(document).ready(function () {
    toastr.options = {
        "positionClass": "toast-top-center"
    }

    $("#username").html(getCookie('username'));
    $("#API").html('asdfasdfasdf');
    update();
    bsNavbarBugWorkaround();
});



   var chartData;// = generateChartData();
   var chartVelocityData;

//   function generateChartData() {
//     var chartData = [];
//     var firstDate = new Date( 2012, 0, 1 );
//     firstDate.setDate( firstDate.getDate() - 1000 );
//     firstDate.setHours( 0, 0, 0, 0 );

//     for ( var i = 0; i < 1000; i++ ) {
//       var newDate = new Date( firstDate );
//       newDate.setHours( 0, i, 0, 0 );

//       var a = Math.round( Math.random() * ( 40 + i ) ) + 100 + i;
//       var b = Math.round( Math.random() * 100000000 );

//       chartData.push( {
//         "date": newDate,
//         "value": a,
//         "volume": b
//       } );
//     }

//     console.log(chartData);
//     return chartData;
//   }

function drawChart() {
  var chart = AmCharts.makeChart( "chartdiv", {
    "type": "stock",
    "theme": "light",
    "categoryAxesSettings": {
      "minPeriod": "mm"
    },

    "dataSets": [ {
      "color": "#b0de09",
      "fieldMappings": [ {
        "fromField": "value",
        "toField": "value"
      }, {
        "fromField": "volume",
        "toField": "volume"
      } ],

      "dataProvider": chartData,
      "categoryField": "date"
    } ],

    "panels": [ {
      "showCategoryAxis": false,
      "title": "RawVelocity",
      "percentHeight": 70,

      "stockGraphs": [ {
        "id": "g1",
        "valueField": "value",
        "type": "smoothedLine",
        "lineThickness": 2,
        "precision": 5,
        "bullet": "round"
      } ],


      "stockLegend": {
        "valueTextRegular": " ",
        "markerType": "none"
      }
    }, {
      "title": "SupplyAmount",
      "percentHeight": 30,
      "stockGraphs": [ {
        "valueField": "volume",
        "type": "column",
        "cornerRadiusTop": 2,
        "fillAlphas": 1
      } ],

      "stockLegend": {
        "valueTextRegular": " ",
        "markerType": "none"
      }
    } ],

    "numberFormatter": {
        "precision": -5,
        "decimalSeparator": ",",
        "thousandsSeparator": ""
    },

    "chartScrollbarSettings": {
      "graph": "g1",
      "usePeriod": "10mm",
      "position": "top"
    },

    "chartCursorSettings": {
      "valueBalloonsEnabled": true
    },

    "periodSelector": {
      "position": "top",
      "dateFormat": "YYYY-MM-DD HH:MM:SS",
      "inputFieldWidth": 150,
      "periods": [ {
        "period": "hh",
        "count": 1,
        "label": "1 hour",
        "selected": true
      }, {
        "period": "hh",
        "count": 2,
        "label": "2 hours"
      }, {
        "period": "hh",
        "count": 5,
        "label": "5 hour"
      }, {
        "period": "hh",
        "count": 12,
        "label": "12 hours"
      }, {
        "period": "MAX",
        "label": "MAX"
      } ]
    },

    "panelsSettings": {
      "usePrefixes": true
    },
  } );
}

function drawVelocityChart() {
  var chart = AmCharts.makeChart( "chartdiv_velocity", {
    "type": "stock",
    "theme": "light",
    "categoryAxesSettings": {
      "minPeriod": "mm"
    },

    "dataSets": [ {
      "color": "#b0de09",
      "fieldMappings": [ {
        "fromField": "value",
        "toField": "value"
      }, {
        "fromField": "volume",
        "toField": "volume"
      } ],

      "dataProvider": chartVelocityData,
      "categoryField": "date"
    } ],

    "panels": [ {
      "showCategoryAxis": false,
      "title": "Filtered Velocity",
      "percentHeight": 70,

      "stockGraphs": [ {
        "id": "g1",
        "valueField": "value",
        "type": "smoothedLine",
        "lineThickness": 2,
        "precision": 5,
        "bullet": "round"
      } ],


      "stockLegend": {
        "valueTextRegular": " ",
        "markerType": "none"
      }
    }, {
      "title": "Volume",
      "percentHeight": 30,
      "stockGraphs": [ {
        "valueField": "volume",
        "type": "column",
        "cornerRadiusTop": 2,
        "fillAlphas": 1
      } ],

      "stockLegend": {
        "valueTextRegular": " ",
        "markerType": "none"
      }
    } ],

    "numberFormatter": {
        "precision": -5,
        "decimalSeparator": ",",
        "thousandsSeparator": ""
    },

    "chartScrollbarSettings": {
      "graph": "g1",
      "usePeriod": "10mm",
      "position": "top"
    },

    "chartCursorSettings": {
      "valueBalloonsEnabled": true
    },

    "periodSelector": {
      "position": "top",
      "dateFormat": "YYYY-MM-DD HH:MM:SS",
      "inputFieldWidth": 150,
      "periods": [ {
        "period": "hh",
        "count": 1,
        "label": "1 hour",
        "selected": true
      }, {
        "period": "hh",
        "count": 2,
        "label": "2 hours"
      }, {
        "period": "hh",
        "count": 5,
        "label": "5 hour"
      }, {
        "period": "hh",
        "count": 12,
        "label": "12 hours"
      }, {
        "period": "MAX",
        "label": "MAX"
      } ]
    },

    "panelsSettings": {
      "usePrefixes": true
    },
  } );
}