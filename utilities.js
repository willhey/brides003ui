function tableToJson(table) {
var data = []; // first row needs to be headers
var headers = [];
for (var i=0; i<table.rows[0].cells.length; i++) {
 headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi,'');
}
// go through cells
for (var i=1; i<table.rows.length; i++) {
var tableRow = table.rows[i]; var rowData = {};
for (var j=0; j<tableRow.cells.length; j++) {
rowData[ headers[j] ] = tableRow.cells[j].innerHTML;
} data.push(rowData);
}
return data;
}

function date2Str(d1){
  var d = d1.getDate();
  var m =  d1.getMonth() + 1;
  var y = d1.getFullYear();
  return(d + "." + m + "." + y);
}

function addNewDialogButtonSet(buttons, frm) {
    var buttonPane = frm.parent().find('.ui-dialog-buttonset');
    $(buttonPane).empty();
    $.each(buttons, function(index, props) {
      nb = '<button type="button" class="ui-button ui-corner-all ui-widget" id="' + props.id+ '">' + props.text + '</button>'
        $(buttonPane).append(nb);
        $('#' + props.id).button().click(props.click);
    });
}

function hideTandem(id){
    $('#' + id + ', label[for=' + id + ']').hide();
}

var uniqueArray = function(arrArg) {
  return arrArg.filter(function(elem, pos,arr) {
    return arr.indexOf(elem) == pos;
  });
};

const arrayToObject = (array, keyField) =>
   array.reduce((obj, item) => {
     obj[item[keyField]] = item
     return obj
   }, {})
