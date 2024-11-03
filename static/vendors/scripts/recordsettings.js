$(document).ready(function() {
    var table = $('.checkbox-datatable').DataTable({
        'scrollX': true,
        'scrollCollapse': true,
        'autoWidth': false,
        'responsive': false,
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
        "language": {
            "info": "_START_-_END_ of _TOTAL_ entries",
            searchPlaceholder: "Search",
            paginate: {
                next: '<i class="ion-chevron-right"></i>',
                previous: '<i class="ion-chevron-left"></i>'
            },
            "emptyTable": "No data available in table"
        },
        'columnDefs': [
            {
                'targets': 0,
                'searchable': false,
                'orderable': false,
                'className': 'dt-body-center',
                'render': function(data, type, full, meta) {
                    return '<div class="dt-checkbox"><input type="checkbox" name="id[]" value="' + $('<div/>').text(data).html() + '"><span class="dt-checkbox-label"></span></div>';
                }
            }
        ],
        'order': [[1, 'asc']]
    });

    var isEditing = false;
    var currentRowNode = null;

    $('#example-select-all').on('click', function() {
        var rows = table.rows({ 'search': 'applied' }).nodes();
        $('input[type="checkbox"]', rows).prop('checked', this.checked);
    });

    $('.checkbox-datatable tbody').on('change', 'input[type="checkbox"]', function() {
        if (!this.checked) {
            var el = $('#example-select-all').get(0);
            if (el && el.checked && ('indeterminate' in el)) {
                el.indeterminate = true;
            }
        }
    });

    $('#addButton').on('click', function() {
        $('#addEntryForm')[0].reset();
        $('#date_entered').val(new Date().toISOString().split('T')[0]);
        $('#imagePreview').hide();
        $('#child_image').val('');
        isEditing = false;
        $('#addEntryModal').modal('show');
    });

    $('#birthday').on('change', function() {
        var birthday = new Date($(this).val());
        var age_in_months = calculateAgeInMonths(birthday);
        $('#age_in_months').val(age_in_months);
    });

    function calculateAgeInMonths(birthday) {
        var today = new Date();
        var years = today.getFullYear() - birthday.getFullYear();
        var months = today.getMonth() - birthday.getMonth();

        if (months < 0) {
            years--;
            months += 12;
        }

        return (years * 12) + months;
    }

    $('#child_image').on('change', function(event) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#imagePreview').attr('src', e.target.result).show();
        };
        reader.readAsDataURL(event.target.files[0]);
    });

    $('#addEntryForm').on('submit', function(e) {
        e.preventDefault();
        alert("Form submitted");
    
        var formData = new FormData(this);
        var imageBase64 = $('#imagePreview').attr('src') || '';

        // Check if there's an image and append it to FormData
        if (imageBase64) {
            formData.append('imageBase64', imageBase64);
        }

        $.ajax({
            type: 'POST',
            url: $(this).attr('action'),
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                addNewEntryToTable(response.newEntry);
                $('#addEntryModal').modal('hide');
                alert('Entry added successfully!');
            },
            error: function(xhr, status, error) {
                alert('An error occurred: ' + xhr.responseText);
            }
        });
    });

    function addNewEntryToTable(entry) {
        const newRowData = [
            `<div class="dt-checkbox"><input type="checkbox" name="select" value="1"><span class="dt-checkbox-label"></span></div>`,
            entry.name,
            entry.gender,
            entry.date_entered,
            entry.birthday,
            entry.age_in_months,
            entry.weight,
            entry.height,
            entry.weight_for_age_status,
            entry.height_for_age_status,
            entry.weight_for_lt_ht_status,
            entry.imageBase64
        ];

        table.row.add(newRowData).draw();
    }

    $('#deleteButton').on('click', function() {
        var selectedRows = table.rows({ search: 'applied' }).nodes().to$().filter(function() {
            return $(this).find('input[type="checkbox"]').is(':checked');
        });

        if (selectedRows.length === 0) {
            alert('Please select at least one row to delete.');
            return;
        }

        var confirmDelete = confirm('Are you sure you want to delete the selected entry(s)?');
        if (confirmDelete) {
            selectedRows.each(function() {
                table.row($(this)).remove();
            });
            table.draw();
            alert('Selected entry(s) have been deleted.');
        }
    });

    $('#editButton').on('click', function() {
        var selectedRows = table.rows({ search: 'applied' }).nodes().to$().filter(function() {
            return $(this).find('input[type="checkbox"]').is(':checked');
        });

        if (selectedRows.length === 1) {
            currentRowNode = selectedRows[0];
            var rowData = table.row(currentRowNode).data();

            // Populate the modal with the selected row data
            $('#first_name').val(rowData[1].split(' ')[0]);
            $('#middle_name').val(rowData[1].split(' ').slice(1, -1).join(' '));
            $('#last_name').val(rowData[1].split(' ').slice(-1)[0]);
            $('#gender').val(rowData[2]);
            $('#date_entered').val(rowData[3]);
            $('#birthday').val(rowData[4]);
            $('#age_in_months').val(rowData[5]);
            $('#weight').val(rowData[6]);
            $('#height').val(rowData[7]);
            $('#weight_for_age_status').val(rowData[8]);
            $('#height_for_age_status').val(rowData[9]);
            $('#weight_for_lt_ht_status').val(rowData[10]);

            // Load image for editing
            if (rowData[11]) {
                $('#imagePreview').attr('src', rowData[11]).show();
            } else {
                $('#imagePreview').hide();
            }

            $('#addEntryModal').modal('show');
            isEditing = true;
        } else {
            alert('Please select exactly one row to edit.');
        }
    });

    function updateTableRow(rowNode, entry) {
        const updatedRowData = [
            `<div class="dt-checkbox"><input type="checkbox" name="select" value="1"><span class="dt-checkbox-label"></span></div>`,
            entry.name,
            entry.gender,
            entry.date_entered,
            entry.birthday,
            entry.age_in_months,
            entry.weight,
            entry.height,
            entry.weight_for_age_status,
            entry.height_for_age_status,
            entry.weight_for_lt_ht_status,
            entry.imageBase64
        ];

        table.row(rowNode).data(updatedRowData).draw();
    }

    $('#viewButton').on('click', function() {
        var selectedRow = table.$('input[type="checkbox"]:checked').closest('tr');
        if (selectedRow.length === 0) {
            alert('Please select a row to view.');
            return;
        }

        var rowData = table.row(selectedRow).data();

        $('#viewName').text(rowData[1]);
        $('#viewGender').text(rowData[2]);
        $('#viewDateEntered').text(rowData[3]);
        $('#viewBirthday').text(rowData[4]);
        $('#viewAgeInMonths').text(rowData[5]);
        $('#viewWeight').text(rowData[6]);
        $('#viewHeight').text(rowData[7]);
        $('#viewWeightForAgeStatus').text(rowData[8]);
        $('#viewHeightForAgeStatus').text(rowData[9]);
        $('#viewWeightForLTHTStatus').text(rowData[10]);

        if (rowData[11]) {
            $('#viewImage').attr('src', rowData[11]).show();
        } else {
            $('#viewImage').hide();
        }

        $('#viewEntryModal').modal('show');
    });

    $('#printButton').on('click', function() {
        printModalContent();
    });

    function printModalContent() {
        var printWindow = window.open('', '_blank', 'width=800,height=600');
        var modalContent = `
            <html>
            <head>
                <title>Print Barangay Entry</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
            </head>
            <body>
                <div class="container">
                    <h1>Barangay Entry</h1>
                    <div id="printContent"></div>
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(modalContent);
        printWindow.document.close();

        var selectedRow = table.$('input[type="checkbox"]:checked').closest('tr');
        if (selectedRow.length === 0) {
            alert('Please select a row to print.');
            printWindow.close();
            return;
        }

        var rowData = table.row(selectedRow).data();
        var printData = `
            <h2>${rowData[1]}</h2>
            <p><strong>Gender:</strong> ${rowData[2]}</p>
            <p><strong>Date Entered:</strong> ${rowData[3]}</p>
            <p><strong>Birthday:</strong> ${rowData[4]}</p>
            <p><strong>Age (in months):</strong> ${rowData[5]}</p>
            <p><strong>Weight:</strong> ${rowData[6]}</p>
            <p><strong>Height:</strong> ${rowData[7]}</p>
            <p><strong>Weight for Age Status:</strong> ${rowData[8]}</p>
            <p><strong>Height for Age Status:</strong> ${rowData[9]}</p>
            <p><strong>Weight for LT/HT Status:</strong> ${rowData[10]}</p>
        `;
        printWindow.document.getElementById('printContent').innerHTML = printData;

        // Print the content after a brief delay
        setTimeout(function() {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
});
