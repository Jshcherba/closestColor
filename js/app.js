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

/**
 *
 * @param givenColorRgb
 * @param preparedVarsArray
 * @returns {Array}
 */
function getArrayOfDistances (givenColorRgb, preparedVarsArray) {
    var distances = [];
    for (var i = 0; i < preparedVarsArray.length - 1; i++) {
        var currentRgbColor = preparedVarsArray[i];
        distances.push(Math.sqrt((givenColorRgb[0] - currentRgbColor[0])*(givenColorRgb[0] - currentRgbColor[0]) + (givenColorRgb[1] - currentRgbColor[1])*(givenColorRgb[1] - currentRgbColor[1]) + (givenColorRgb[2] - currentRgbColor[2])*(givenColorRgb[2] - currentRgbColor[2])));
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