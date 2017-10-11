/**
 *
 * @param message
 * @param isError
 */
function showMessage(message, isError) {
    $('#result').removeClass('error');
    if (isError) {
        $('#result').addClass('error');
    }
    $('#result').html(message);
}

/**
 *
 * @param hex : String
 * @returns {*[]}
 */
function hexToRgb(hex) {
    var h = hex.replace('#', '');
    h = h.replace(';', '');
    h =  h.match(new RegExp('(.{' + h.length/3 + '})', 'g'));

    for(var i = 0; i < h.length; i++)
        h[i] = parseInt(h[i].length == 1 ? h[i] + h[i]:h[i], 16);

    return h;
}

function RGB2HSV(color){
    var var_R = ( color[0] / 255 )
    var var_G = ( color[1] / 255 )
    var var_B = ( color[2] / 255 )

    var var_Min = Math.min( var_R, var_G, var_B )    //Min. value of RGB
    var var_Max = Math.max( var_R, var_G, var_B )    //Max. value of RGB
    var del_Max = var_Max - var_Min             //Delta RGB value

    var L = ( var_Max + var_Min )/ 2

    if ( del_Max == 0 )                     //This is a gray, no chroma...
    {
        var H = 0
        var S = 0
    }
    else                                    //Chromatic data...
    {
        if ( L < 0.5 ) S = del_Max / ( var_Max + var_Min )
        else           S = del_Max / ( 2 - var_Max - var_Min )

        var del_R = ( ( ( var_Max - var_R ) / 6 ) + ( del_Max / 2 ) ) / del_Max
        var del_G = ( ( ( var_Max - var_G ) / 6 ) + ( del_Max / 2 ) ) / del_Max
        var del_B = ( ( ( var_Max - var_B ) / 6 ) + ( del_Max / 2 ) ) / del_Max

        if      ( var_R == var_Max ) H = del_B - del_G
        else if ( var_G == var_Max ) H = ( 1 / 3 ) + del_R - del_B
        else if ( var_B == var_Max ) H = ( 2 / 3 ) + del_G - del_R

        if ( H < 0 ) H += 1
        if ( H > 1 ) H -= 1
    }
    return [H, S, L];
}

/**
 *
 * @param arrayOfVars
 * @returns {Array}
 */
function prepareVarsArray (arrayOfVars) {
    var preparedVarsArray = [];
    var isProperVarRegex = new RegExp("^\\${1}[\\w-]+:\\s*?\\#+\\w+;$", 'i');
    for (var i = 0; i < arrayOfVars.length - 1; i++) {
        var currentValue = arrayOfVars[i];
        if (isProperVarRegex.test(currentValue)) {
            var spitedValue = currentValue.split(":");
            preparedVarsArray.push(hexToRgb(spitedValue[1].trim()));
        }
    }
    return preparedVarsArray;
}

function calcDistance(x, y, z) {
    return Math.sqrt(x*x*100+y*y+z*z);
}

/**
 *
 * @param givenColorRgb
 * @param preparedVarsArray
 * @returns {Array}
 */
function getArrayOfDistances (givenColorRgb, preparedVarsArray) {
    var distances = [];
    var givenColorHSB = RGB2HSV(givenColorRgb);
    var currentColorHSB = "";
    for (var i = 0; i < preparedVarsArray.length - 1; i++) {
        var currentRgbColor = preparedVarsArray[i];
        currentColorHSB = RGB2HSV(currentRgbColor);
        distances.push(
            calcDistance(givenColorHSB[0] - currentColorHSB[0],
                        givenColorHSB[1] - currentColorHSB[1],
                        givenColorHSB[2] - currentColorHSB[2])
        );
    }
    return distances;
}

Array.prototype.hasMin = function() {
    return this.reduce(function(prev, curr){
        return prev < curr ? prev : curr;
    });
}

$(document).ready(function() {
    $('.instruction').on('click', function () {
        $('.info-wrapper').toggle();
    });
    $('#closestColorForm').on('submit', function (e) {
        e.preventDefault();
        var colorValue = $('#colorValue').val().trim();
        var variablesValue = $('#variables').val().trim();
        if (colorValue == '' || variablesValue == "") {
            showMessage('One or both fields are empty, please provide data', true);
        } else {
            $('.color-value').css('background', '#' + colorValue.replace('#', ''));
            $('.color-label').css('display', 'inline-block');
            var color = hexToRgb(colorValue);
            var arrayOfVars = variablesValue.split('\n');
            var preparedVarsArray = prepareVarsArray(arrayOfVars);
            var arrayOfDistances = getArrayOfDistances(color, preparedVarsArray);
            var minDistance = arrayOfDistances.hasMin();
            var indexOfFirstMinDistance = arrayOfDistances.indexOf(minDistance);
            var validRgbResult = preparedVarsArray[indexOfFirstMinDistance].join(",");
            var spanString = '&nbsp;<span class="added" style="background: rgb(' + validRgbResult + ');"></span>';
            showMessage(arrayOfVars[indexOfFirstMinDistance] + spanString + ' Result color', false);
        }
    })
});