// Registering pageinit handler 
$('#notePage').live('pageinit', notePage_pageinitHandler);

// Reference to newly stored photo
var newPhotoRef;

/**
 * notePage pageinit handler
 * 
 * @param event
 */
function notePage_pageinitHandler(event) {

    // Setting note form properties if note selected
    if (currentNote) {
        // Setting note title
        $('#txtTitle').val(currentNote.title);
        // Setting note content
        $('#txtContent').val(currentNote.content);
        // Loading photo if available
        if (currentNote.photo) {
            $.get(currentNote.photo.url, function(data) {
                $('#img').attr('src', data);
            });
        }
    }

    // Clearing previous photo ref
    newPhotoRef = null;

    // Registering btnBack click handler
    $('#btnBack').on('click', btnBack_clickHandler);

    // Registering btnPhoto click handler
    $('#btnPhoto').on('click', btnPhoto_clickHandler);

}

/**
 * btnBack click handler
 * 
 * @param event
 */
function btnBack_clickHandler(event) {
    var url = 'https://api.parse.com/1/classes/Note', type = 'POST', data = {
        title : $('#txtTitle').val(),
        content : $('#txtContent').val()
    };

    // If photo was take set ref to it
    if (newPhotoRef)
        data.photo = newPhotoRef;

    // Change request props if this is already existing note
    if (currentNote) {
        type = 'PUT';
        url = url + '/' + currentNote.objectId;
    }

    // Displaying note saving message
    $.mobile.showPageLoadingMsg("a", "Saving note...", true);

    $.ajax({
        url : url,
        type : type,
        contentType : 'application/json',
        data : JSON.stringify(data),
        error : ajax_errorHandler,
        success : function(result) {
            $.mobile.hidePageLoadingMsg();
            $.mobile.changePage("index.html");
            loadNotes();
        }
    });
}

/**
 * btnPhoto click handler
 * 
 * @param event
 */
function btnPhoto_clickHandler(event) {
    // Camera app parameters
    var cameraParams = {
        quality : 20,
        destinationType : Camera.DestinationType.DATA_URL
    };
    // Running built-in camera app
    navigator.camera.getPicture(camera_successHandler, function(message) {
        alert('Camera app on your device failed: ' + message);
    }, cameraParams);
}

/**
 * Camer success handler
 * 
 * @param photoData
 */
function camera_successHandler(photoData) {
    // Setting #img src to the local file
    $('#img').attr('src', 'data:image/jpeg;base64,' + photoData);
    
    // Displaying photo upload message
    $.mobile.showPageLoadingMsg("a", "Uploading photo...", true);

    // Making the call to store photo file
    $.ajax({
        url : 'https://api.parse.com/1/files/photo.jpg',
        type : 'POST',
        contentType : 'text/plain',
        data : 'data:image/jpeg;base64,' + photoData,
        error : ajax_errorHandler,
        success : function(result) {
            $.mobile.hidePageLoadingMsg();
            newPhotoRef = result;
        }
    });
}

function ajax_errorHandler(jqXHR, textStatus, errorThrown) {
    $.mobile.hidePageLoadingMsg();
    console.log(JSON.stringify(jqXHR));
    alert('Error saving note: ' + textStatus);
}
