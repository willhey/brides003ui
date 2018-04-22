
var dialog
var brides = {};
var chat = {};
var hols ={};
hols.statutory = {};
var prices = null;
var bookings = {};
var addedBride = -1;
var curBride = -1;

var disallowed = {"Active":[["Active",true],["Indicative",false],["Booking",false],["Booked",true],["Closed",false]],
              "Indicitive":[["Active",false],["Indicative",true],["Booking",false],["Booked",true],["Closed",false]],
              "Booking":[["Active",false],["Indicative",false],["Booking",true],["Booked",false],["Closed",false]],
              "Booked":[["Active",true],["Indicative",true],["Booking",true],["Booked",true],["Closed",false]]}

$( document ).ready(function() {
  uibuilder.send( { 'topic':'init', 'payload':'ready' } )
  uibuilder.onChange('msg', function(newVal){
        switch(newVal.topic){
          case "brides":
            brides = newVal.payload;
            prepBrideDropdown();
            makeCalendar();
            break;
          case "chat":
            chat = newVal.payload;
            showChat();
            break;
          case "hols":
            hols = arrayToObject(newVal.payload, "_id")
            makeCalendar();
            break;
          case "prices":
            prices = arrayToObject(newVal.payload, "_id")
            makeCalendar();
            break;
        }
    })  // END UIBUILDER ONCHANGE
//NEW BRIDE DIALOG
    brideDialog = $( "#brideForm" ).dialog({autoOpen: false, height: 600, width: 500, modal: true, buttons: [ { } ] });
    selectBrideDialog = $( "#selectBrideForm" ).dialog({autoOpen: false, height: 200, width: 500, modal: true, buttons: [ { } ] });
    chatDialog = $( "#chatForm" ).dialog({autoOpen: false, height: 500, width: 500, modal: true, buttons: [ { } ] });

}) // --- End of JQuery Ready --- //

function myFunction() {
    var x = document.getElementById("toDo");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function showChat(){
  csv = '';
  var table = document.getElementById("chatTable");
  var rowCount = table.rows.length;
  for (var x=rowCount-1; x>=0; x--) {
    table.deleteRow(x);
  }
var row = table.insertRow(-1);
var headerCell = document.createElement("TH");
headerCell.innerHTML = 'Chat date';
row.appendChild(headerCell);
var headerCell = document.createElement("TH");
headerCell.innerHTML = 'Moniker';
row.appendChild(headerCell);
var headerCell = document.createElement("TH");
headerCell.innerHTML = 'Text';
row.appendChild(headerCell);
var headerCell = document.createElement("TH");
headerCell.innerHTML = 'Reminder';
row.appendChild(headerCell);
var headerCell = document.createElement("TH");
headerCell.innerHTML = 'Important';
row.appendChild(headerCell);
csv += 'Moniker\tDate\tText\tReminder\tImportant\n'
if (curBride == -1){ return }
for(i=0; i < chat.length; i++){
  if (brides[curBride].moniker == chat[i].moniker){
    var showMe = true;
    if ($('#chatOnlyReminders')[0].checked && chat[i].reminder == 0){showMe = false}
    if ($('#chatImportant')[0].checked && chat[i].important == false){showMe = false}
    if (showMe){
      var row = table.insertRow(-1);
      var dc = date2Str(new Date(chat[i].chatDate))
      if (chat[i].reminder != 0){
        dr = date2Str(new Date(chat[i].reminder))
      } else {
        dr = '';
      }
      str1 = "Moniker - " + chat[i].moniker + "\r";
      str1 += "Date of chat - " + dc + "\r";
      str1 += chat[i].text + "\r";
      str1 += "Reminder date - " + dr + "\r";
      csv += chat[i].moniker + "\t" + dc + "\t" + chat[i].text + "\t" + dr + "\t" + chat[i].important + "\r";
      row.title = str1;
      var cell1 = row.insertCell(-1);
      cell1.innerHTML = dc;
      var cell1 = row.insertCell(-1);
      cell1.innerHTML = chat[i].moniker;
      var cell2 = row.insertCell(-1);
      cell2.innerHTML = chat[i].text.substr(0,20);
      var cell3 = row.insertCell(-1);
      cell3.innerHTML = dr;
      cell3.setAttribute('id', chat[i]._id);
      cell3.setAttribute('rev', chat[i]._rev);
      cell3.onclick = function () {
         removeReminder(this.getAttribute("id"), this.getAttribute("rev"));
     };
      var cell4 = row.insertCell(-1);
      cell4.innerHTML = chat[i].important;

    }
   }
 }
 $('#chatCSV').attr('csv', csv)
}

function chatCSV(){
  window.prompt("Copy to clipboard: Ctrl+C, Enter", csv);
}

function removeReminder(id, rev){
  var thisChat = chat.find(function (obj) { return obj._id === id; });
  thisChat.reminder = 0;
  if( confirm("Confirm the chat is completed")){
    uibuilder.send( { 'topic':'changeChat', 'payload':thisChat } )
  }
}


function addChatForm(brideMoniker) {
  thisBride = {};
  for(i=0; i < brides.length; i++){
    if (brides[i].moniker == brideMoniker){
      thisBride = brides[i];
    }
  }
  $('#dialogChatMoniker').val(thisBride.moniker);
  $('#dialogChatMoniker').prop('readonly', true);

  var buttons = [
      {id: "addChat",  text: "Add Chat", click: function () {addChat(); } },
      {id: "cancel", text: "Cancel", click: function () {chatDialog.dialog( "close" ); } }
        ]
  addNewDialogButtonSet(buttons, chatDialog);
  chatDialog.dialog( "open" );
}

function addChat() {
  var moniker = $( "#dialogChatMoniker" )[0].value;
  var payload = {};
  payload.moniker = moniker;
  payload.chatDate = new Date().setHours(0,0,0,0);
  payload.text = $( "#dialogTextArea" )[0].value
  var remDays = parseInt($( "#daysToReminder" )[0].value)
  if (remDays > 0){
    dd = new Date();
    dd.setDate(dd.getDate()+remDays);
    payload.reminder = Number(dd)
  } else {
    payload.reminder = 0;
  }
  payload.important = $( "#chatFormImportant" )[0].checked
  console.log(payload)
  uibuilder.send( { 'topic':'newChat', 'payload':payload } )
  chatDialog.dialog( "close" );
}


function prepBrideDropdown(){
  $("#dropdownBrides").find('option').remove();
  var matches = [];
  $("input:checkbox[name=brideStatus]:checked").each(function(){
      matches.push($(this).val());
  });

  for (var member in bookings) delete bookings[member];

  for(i=0; i < brides.length; i++){
    if (brides[i].weddingDate != 0){
      wDate = brides[i].weddingDate;
      if (!(wDate in bookings)){
        bookings[wDate] = [];
      }
      aBooking = {}
      aBooking.moniker = brides[i].moniker;
      aBooking.status = brides[i].status;
      bookings[wDate].push(aBooking)
    }

    if($.inArray(brides[i].status, matches) != -1)
           $("#dropdownBrides").append($('<option>', { value:i,  text : brides[i].moniker  }));
           if (brides[i].moniker == addedBride){ addedBride = i }
       }
  if (addedBride != -1){ showBride({"value":addedBride})}
  makeCalendar()
}


function changeBride() {
  //NEED TO CHECK AT LEAST ONE RADIO
  var moniker = $( "#dialogMoniker" )[0].value;
  var dte = $('#brideForm').attr("dateAsNumber");
  var da = new Date(parseInt(dte))
  var payload = {};
  payload.moniker = moniker;
  payload.weddingDate = Number(da);
  payload.status = $('input[type=radio][name=radioStatus]:checked').attr('id').slice(5);
  uibuilder.send( { 'topic':'changeBride', 'payload':payload } )
  brideDialog.dialog( "close" );
  }


function addBride() {
  var moniker = $( "#dialogMoniker" )[0].value;
  var firstName = $( "#dialogFirstName" )[0].value;
  var lastName = $( "#dialogLastName" )[0].value;
  for (index = 0; index < brides.length; ++index) {
      if (moniker == brides[index].moniker){
          alert("Moniker must be unique");
          return
      }
  }
  addedBride = moniker;
  var payload = {};
  payload.moniker = moniker;
  payload.firstName = firstName;
  payload.lastName = lastName;
  payload.initDate = new Date().setHours(0,0,0,0);
  payload.status = 'Active';
  payload.weddingDate = 0;
  uibuilder.send( { 'topic':'newBride', 'payload':payload } )
  brideDialog.dialog( "close" );
}

function showBride(b){
  curBride = b.value;
  $('#theBrideMoniker').val(brides[b.value].moniker);
  $('#theBrideFirstName').val(brides[b.value].firstName);
  $('#theBrideLastName').val(brides[b.value].lastName);
  var da = new Date(brides[b.value].initDate)
  $('#theBrideInitialDate').val(date2Str(da));
  $('#theBrideStatus').val(brides[b.value].status);
  if (brides[b.value].weddingDate != 0){
    var dw = new Date(brides[b.value].weddingDate)
    $('#theBrideWeddingDate').val(date2Str(dw));
    $('#changeBrideButton').prop('disabled', false);
  }else{
    $('#theBrideWeddingDate').val(" - ");
    $('#changeBrideButton').prop('disabled', true);
  }
  $('#addChatButton').prop('disabled', false);
  showChat();
}

function AskWhichBride(src, dte, bridesList){
  var bridesArray = bridesList.split(",")
  bridesArray.splice(-1);
  var bridesObjs = [];
  if (bridesArray.length == 0){ // no bride on this date so use 'thebride'
    var br = $('#theBrideMoniker')[0].value
    changeBrideForm('fromCalendar', dte, br)
    return
  }else{
    bridesArray.push($('#theBrideMoniker')[0].value)  // adding "theBride to the list"
    bridesArray = uniqueArray(bridesArray)
    for (bb=0; bb < bridesArray.length; bb++){
      for(i=0; i < brides.length; i++){
        if (brides[i].moniker == bridesArray[bb]){
          bridesObjs.push(brides[i])
        }
      }
    }
    var buttons = [ ]
    for (bb=0; bb < bridesObjs.length; bb++){
      newBut = {};
      newBut.id = bridesObjs[bb].moniker;
      newBut.text = bridesObjs[bb].moniker + "   " +  bridesObjs[bb].status;
      newBut.click = function () {changeBrideForm('fromCalendar', dte,  this.id)};
      buttons.push(newBut);
    }
    buttons.push({id: "cancel2", text: "Cancel", click: function () {selectBrideDialog.dialog( "close" ); } })
    addNewDialogButtonSet(buttons, selectBrideDialog);
    selectBrideDialog.dialog( "open" );
  }
}

function changeBrideForm(src, dte, brideMoniker) {
  thisBride = {};
  for(i=0; i < brides.length; i++){
    if (brides[i].moniker == brideMoniker){
      thisBride = brides[i];
    }
  }
  $('#dialogMoniker').val(thisBride.moniker);
  $('#dialogFirstName').val(thisBride.firstName);
  $('#dialogLastName').val(thisBride.lastName);
  $('#dialogStatus').val(thisBride.status);
  if (src == 'fromButton'){ var dw = new Date(thisBride.weddingDate) }
  if (src == 'fromCalendar'){ var dw = new Date(parseInt(dte))  }
  $('#dialogWeddingDate').val(date2Str(dw));
  $('#brideForm').attr("dateAsNumber",Number(dw));

  $('#dialogMoniker').prop('readonly', true);
  $('#dialogFirstName').prop('readonly', true);
  $('#dialogLastName').prop('readonly', true);
  $('#dialogWeddingDate').prop('readonly', true);
  $('#dialogStatus').prop('readonly', true);
  $('#brideForm').dialog('option', 'title', 'Change Bride Status');
  $('#stateRadio').show();
  $('#dialogStatus').show();

//SET RADIO BUTTONS
  thisDisallowed = disallowed[thisBride.status];
  for(i=0; i < thisDisallowed.length; i++){
    $('#state'+ thisDisallowed[i][0]).attr('disabled', thisDisallowed[i][1]);
  }

    var buttons = [
      {id: "confirmChange",  text: "Confirm Change", click: function () {changeBride(); } },
      {id: "cancel", text: "Cancel", click: function () {brideDialog.dialog( "close" ); } }
        ]
  addNewDialogButtonSet(buttons, brideDialog);
  brideDialog.dialog( "open" );
  selectBrideDialog.dialog( "close" );
}

function newBrideForm() {
    hideTandem('dialogWeddingDate')
    hideTandem('dialogStatus');
    $('#dialogMoniker').prop('readonly', false);
    $('#dialogFirstName').prop('readonly', false);
    $('#dialogLastName').prop('readonly', false);
    $('#stateRadio').hide();
    $('#brideForm').dialog('option', 'title', 'Add New Bride');
    var buttons = [
        {id: "addNewBride",  text: "Add New Bride", click: function () {addBride(); } },
        {id: "cancel", text: "Cancel", click: function () {brideDialog.dialog( "close" ); } }
          ]
    addNewDialogButtonSet(buttons, brideDialog);
    brideDialog.dialog( "open" );
}

function makeCalendar(){
  var days = ["S","M","T","W","T","F","S"];
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var dd = new Date(2019,0,1)
  var yr = 0;
  var thisMonth = 99;
  var table = document.getElementById("myTable");
  var rowCount = table.rows.length;
  for (var x=rowCount-1; x>=0; x--) {
    table.deleteRow(x);
  }
   //MAKE HEADER
   var row = table.insertRow(-1);
   var cell1 = row.insertCell(-1);
   cell1.setAttribute("tableStyle", "firstCol")
   for (i = 0; i < 37; i++) {
      var cell1 = row.insertCell(-1);
      var a = days[((i+6) % 7)];
      cell1.innerHTML = a
    }
   for (i = 0; i < 730; i++) {
     if (yr != dd.getFullYear()){
       yr = dd.getFullYear();
       var row = table.insertRow(-1);
       var celly = row.insertCell(-1);
       celly.innerHTML = yr
     }
     var dayNum = dd.getDay();
     if (dd.getMonth() != thisMonth){
       thisMonth = dd.getMonth();

       var row = table.insertRow(-1);
  //ADD MONTH &PAD BLANK DAYS
      var cell1 = row.insertCell(-1);
      cell1.innerHTML = months[dd.getMonth()];
       if (dayNum < 6){
         for (b = -1; b < dayNum; b++) {
           var cell1 = row.insertCell(-1);
           cell1.setAttribute("tableStyle", "blank")
         }
       }
     }
     var cell1 = row.insertCell(-1);
     cell1.id = dd;
     cell1.setAttribute("dateAsNumber", Number(dd));
     cell1.innerHTML = dd.getDate();
     var str1 = '';
     var str2 = '';
     var icon = '';
     if (Number(dd) in bookings){
       cell1.setAttribute("data-brideList2", bookings[Number(dd)])
       for (index = 0; index < bookings[Number(dd)].length; ++index) {
         var ev = bookings[Number(dd)][index];
         str1 += ev.moniker + " " + ev.status + "\n";
         str2 += ev.moniker + ","
         if (ev.status == 'Indicitive'){ icon = 'indicitive.png';}
         if (ev.status == 'Booking'){ icon = 'booking.png';}
         if (ev.status == 'Booked'){ icon = 'booked.png';}
       }
       cell1.title = str1;
       cell1.innerHTML = cell1.innerHTML + "<img src=" + icon +" />";
       //cell1.innerHTML = cell1.innerHTML + "<img src='bluecircle.png' width=10 height=10 alt='hello'/>";
     }else{//get price
       var m = dd.getMonth();
       var d = dd.getDay();
       var y = dd.getFullYear();
       if (prices != null){
         p = prices[y][m][d];
         cell1.title = "£" + p;
       }
     }
     cell1.setAttribute("brideList", str2)
     cell1.onclick = function () {
        AskWhichBride('fromCalendar', this.getAttribute("dateAsNumber"), this.getAttribute("brideList"));
    };

    if (dayNum == 0 || dayNum == 6){
      cell1.setAttribute("tableStyle", "weekend")
    }else{
      cell1.setAttribute("tableStyle", "weekday")
    }
    if (Number(dd) in hols.statutory){
       cell1.setAttribute("tableStyle", "weekend")
     }



    dd.setDate(dd.getDate()+1);
  };
}


// EOF
