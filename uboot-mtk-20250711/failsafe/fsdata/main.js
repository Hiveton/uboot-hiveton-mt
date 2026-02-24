/**
 * U-Boot Failsafe - Main JavaScript
 * Handles file uploads, progress tracking, and AJAX communication
 */

function ajax(opt) {
    var xmlhttp;

    if (window.XMLHttpRequest) {
        // IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // IE6, IE5
        xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
    }

    xmlhttp.upload.addEventListener('progress', function (e) {
        if (opt.progress)
            opt.progress(e)
    })

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (opt.done)
                opt.done(xmlhttp.responseText);
        }
    }

    if (opt.timeout)
        xmlhttp.timeout = opt.timeout;

    var method = 'GET';

    if (opt.data)
        method = 'POST'

    xmlhttp.open(method, opt.url);
    xmlhttp.send(opt.data);
}

function startup(){
    getversion();
    getmtdlayoutlist();
}

function getmtdlayoutlist() {
    ajax({
        url: '/getmtdlayout',
        done: function(mtd_layout_list) {
            if (mtd_layout_list == "error")
                return;

            var mtd_layout = mtd_layout_list.split(';');

            var currentMtdEl = document.getElementById('current_mtd_layout');
            if (currentMtdEl) {
                currentMtdEl.innerHTML = "Current MTD layout: <strong>" + mtd_layout[0] + "</strong>";
            }

            var e = document.getElementById('mtd_layout_label');
            if (!e) return;

            for (var i=1; i<mtd_layout.length; i++) {
                if (mtd_layout[i].length > 0) {
                    e.options.add(new Option(mtd_layout[i], mtd_layout[i]));
                }
            }
            
            var mtdLayoutEl = document.getElementById('mtd_layout');
            if (mtdLayoutEl) {
                mtdLayoutEl.classList.remove('hidden');
            }
        }
    })
}

function getversion() {
    ajax({
        url: '/version',
        done: function(version) {
            var versionEl = document.getElementById('version');
            if (versionEl) {
                versionEl.innerHTML = version;
            }
        }
    })
}

function upload(name) {
    var file = document.getElementById('file').files[0]
    if (!file)
        return

    // Hide upload form
    var uploadCard = document.getElementById('upload-card');
    if (uploadCard) uploadCard.classList.add('hidden');
    
    // Show progress card
    var progressCard = document.getElementById('progress-card');
    if (progressCard) progressCard.classList.remove('hidden');

    var form = new FormData();
    form.append(name, file);

    var mtd_layout_list = document.getElementById('mtd_layout_label');
    if (mtd_layout_list && mtd_layout_list.options.length > 0) {
        var mtd_idx = mtd_layout_list.selectedIndex;
        form.append("mtd_layout", mtd_layout_list.options[mtd_idx].value);
    }

    ajax({
        url: '/upload',
        data: form,
        done: function(resp) {
            if (resp == 'fail') {
                location = '/fail.html';
            } else {
                const info = resp.split(' ');

                // Hide progress card
                if (progressCard) progressCard.classList.add('hidden');
                
                // Show info card
                var infoCard = document.getElementById('info-card');
                if (infoCard) infoCard.classList.remove('hidden');

                // Update size
                var sizeEl = document.getElementById('size');
                if (sizeEl) sizeEl.innerHTML = info[0];

                // Update MD5
                var md5El = document.getElementById('md5');
                if (md5El) md5El.innerHTML = info[1];

                // Update MTD if available
                if (info[2]) {
                    var mtdEl = document.getElementById('mtd');
                    var mtdInfoItem = document.getElementById('mtd-info-item');
                    if (mtdEl) mtdEl.innerHTML = info[2];
                    if (mtdInfoItem) mtdInfoItem.classList.remove('hidden');
                }

                // Show upgrade button
                var upgradeEl = document.getElementById('upgrade');
                if (upgradeEl) upgradeEl.classList.remove('hidden');
            }
        },
        progress: function(e) {
            var percentage = parseInt(e.loaded / e.total * 100);
            
            // Update progress bar
            var progressFill = document.getElementById('progress-fill');
            var progressText = document.getElementById('progress-text');
            
            if (progressFill) {
                progressFill.style.width = percentage + '%';
            }
            if (progressText) {
                progressText.innerHTML = percentage + '%';
            }
        }
    })
}

// Legacy compatibility - map old element IDs if they exist
function checkLegacyElements() {
    // If the page has legacy elements, adapt them
    var legacyBar = document.getElementById('bar');
    var legacySize = document.getElementById('size');
    var legacyMd5 = document.getElementById('md5');
    var legacyMtd = document.getElementById('mtd');
    var legacyUpgrade = document.getElementById('upgrade');
    var legacyHint = document.getElementById('hint');
    var legacyForm = document.getElementById('form');
    
    // If legacy layout detected, apply compatible styling
    if (legacyBar && !document.getElementById('progress-fill')) {
        // Old layout - use CSS custom property for progress
        legacyBar.setAttribute('style', '--percent: 0');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkLegacyElements();
});
