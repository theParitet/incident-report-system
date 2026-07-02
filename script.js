$(function () {
    const incidentForm = $("#incident-form");
    const incidentModal = new bootstrap.Modal("#incident-modal");

    let editingIndex = null;

    const openModal = (mode) => {
        if (mode === "edit") {
            $("#incident-modal-title").text("Edit incident");
            $("#save-incident").text("Save");
        } else {
            $("#incident-modal-title").text("Add incident");
            $("#save-incident").text("Add");
        }
        incidentModal.show();
    };

    $("#incident-modal").on("hidden.bs.modal", function () {
        incidentForm.removeClass("was-validated");
        incidentForm[0].reset();
        editingIndex = null;
    });

    const COLUMNS = [
        { key: "title", label: "Title" },
        { key: "location", label: "Location" },
        { key: "type", label: "Type" },
        { key: "priority", label: "Priority" },
        { key: "status", label: "Status" },
        { key: "reporter", label: "Reporter" },
        { key: "datetime", label: "Date/time" },
        { key: "description", label: "Description" },
    ];

    const saveIncident = () => {
        const incident = {
            title: $("#incident-title").val(),
            location: $("#incident-location").val(),
            type: $("#incident-type").val(),
            priority: $("#incident-priority").val(),
            status: $("#incident-status").val(),
            reporter: $("#incident-reporter").val(),
            datetime: $("#incident-datetime").val(),
            description: $("#incident-description").val(),
        };

        const incidents = JSON.parse(localStorage.getItem("incidents")) || [];
        if (editingIndex === null) {
            incidents.push(incident);
        } else {
            incidents[editingIndex] = incident;
        }
        localStorage.setItem("incidents", JSON.stringify(incidents));
    };

    const startEdit = (index) => {
        const incidents = JSON.parse(localStorage.getItem("incidents")) || [];
        const incident = incidents[index];
        if (!incident) return;

        $("#incident-title").val(incident.title);
        $("#incident-location").val(incident.location);
        $("#incident-type").val(incident.type);
        $("#incident-priority").val(incident.priority);
        $("#incident-status").val(incident.status);
        $("#incident-reporter").val(incident.reporter);
        $("#incident-datetime").val(incident.datetime);
        $("#incident-description").val(incident.description);

        editingIndex = index;
        openModal("edit");
    };

    const deleteIncident = (index) => {
        const incidents = JSON.parse(localStorage.getItem("incidents")) || [];
        incidents.splice(index, 1);
        localStorage.setItem("incidents", JSON.stringify(incidents));
        renderTable();
        renderKpis();
    };

    const renderTable = () => {
        const incidents = JSON.parse(localStorage.getItem("incidents")) || [];

        const visible = $(".col-toggle:checked")
            .map(function () {
                return Number($(this).data("col"));
            })
            .get();

        const headerCells = visible
            .map((i) => `<th>${COLUMNS[i].label}</th>`)
            .join("");
        $("#preview-data thead").html(
            `<tr>${headerCells}<th>Actions</th></tr>`,
        );

        if (incidents.length === 0) {
            $("#preview-data tbody").html(
                `<tr><td colspan="${visible.length + 1}" class="text-secondary">No incidents yet.</td></tr>`,
            );
            return;
        }

        const rows = incidents
            .map((incident, index) => {
                const cells = visible
                    .map((i) => `<td>${incident[COLUMNS[i].key]}</td>`)
                    .join("");
                const actions = `<td class="text-nowrap">
                    <button type="button" class="btn btn-sm btn-outline-secondary edit-incident" data-index="${index}">Edit</button>
                    <button type="button" class="btn btn-sm btn-outline-danger delete-incident" data-index="${index}">Delete</button>
                </td>`;
                return `<tr>${cells}${actions}</tr>`;
            })
            .join("");
        $("#preview-data tbody").html(rows);
    };

    const renderKpis = () => {
        const incidents = JSON.parse(localStorage.getItem("incidents")) || [];
        $("#kpi-total").text(incidents.length);
        $("#kpi-critical").text(
            incidents.filter((i) => i.priority === "Critical").length,
        );
        $("#kpi-active").text(
            incidents.filter((i) => i.status === "Active").length,
        );
        $("#kpi-resolved").text(
            incidents.filter((i) => i.status === "Resolved").length,
        );
    };

    $("#add-incident-btn").on("click", function () {
        editingIndex = null;
        openModal("add");
    });
    $(".col-toggle").on("change", renderTable);

    $("#preview-data tbody").on("click", ".edit-incident", function () {
        startEdit(Number($(this).data("index")));
    });

    const deleteModal = new bootstrap.Modal("#delete-modal");
    let pendingDeleteIndex = null;

    $("#preview-data tbody").on("click", ".delete-incident", function () {
        pendingDeleteIndex = Number($(this).data("index"));
        deleteModal.show();
    });

    $("#confirm-delete").on("click", function () {
        if (pendingDeleteIndex !== null) {
            deleteIncident(pendingDeleteIndex);
            pendingDeleteIndex = null;
        }
        deleteModal.hide();
    });

    $("#extended-view-btn").on("click", function () {
        $("#dashboard-column").toggleClass("d-none");
        $("#table-column").toggleClass("col-lg-6 col-xxl-7");
    });

    incidentForm.on("submit", function (event) {
        event.preventDefault();
        const form = this;

        if (!form.checkValidity()) {
            $(form).addClass("was-validated");
            return;
        }

        saveIncident();
        incidentModal.hide();
        renderTable();
        renderKpis();
    });

    renderTable();
    renderKpis();
});

// pie chart
$(function () {
    const canvas = document.getElementById("pie-chart");
    if (!canvas) return;

    const PALETTE = [
        "#0d6efd",
        "#dc3545",
        "#ffc107",
        "#198754",
        "#6f42c1",
        "#fd7e14",
        "#20c997",
        "#6c757d",
    ];

    const pieChart = new Chart(canvas, {
        type: "pie",
        data: { labels: [], datasets: [{ data: [] }] },
        options: { responsive: true, maintainAspectRatio: false },
    });

    // { label: count }
    const updatePieChart = (counts) => {
        const labels = Object.keys(counts);
        pieChart.data.labels = labels;
        pieChart.data.datasets[0].data = Object.values(counts);
        pieChart.data.datasets[0].backgroundColor = labels.map(
            (_, i) => PALETTE[i % PALETTE.length],
        );
        pieChart.update();
    };

    // Reusable from anywhere (e.g. the console): updatePieChart({ Open: 3, ... })
    window.updatePieChart = updatePieChart;

    /*
        could render:
        priority
        status
        type
    */
    const incidents = JSON.parse(localStorage.getItem("incidents")) || [];
    const byStatus = incidents.reduce((acc, incident) => {
        acc[incident.status] = (acc[incident.status] || 0) + 1;
        return acc;
    }, {});
    updatePieChart(byStatus);
});

// draft
// $(function(){
//     $('[l-key]').each(function (index, item) {
//         const key = $(item).attr('l-key');
//         const lang = resources.find(i=>i.id === key);
//     });
//     $(item).text(lang === 'ar' : lang.ar ? lang.en);
// })
