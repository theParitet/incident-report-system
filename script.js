// theme
$(function () {
    let theme = localStorage.getItem("theme") || "dark";
    const changeTheme = (theme) => {
        if (theme === "dark") {
            $("#theme-picker-icon").removeClass("bi-sun-fill");
            $("#theme-picker-icon").addClass("bi-moon-stars-fill");
        } else {
            $("#theme-picker-icon").addClass("bi-sun-fill");
            $("#theme-picker-icon").removeClass("bi-moon-stars-fill");
        }
        $(document.body).attr("data-bs-theme", theme);
    };
    changeTheme(theme);

    $("#theme-picker").on("click", function () {
        theme = theme === "dark" ? "light" : "dark";

        changeTheme(theme);

        localStorage.setItem("theme", theme);
    });
});

// columns
$(function () {
    const saved = JSON.parse(localStorage.getItem("columns"));

    if (saved) {
        $(".col-toggle").each(function () {
            const shown = saved.includes(Number($(this).data("col")));
            $(this).prop("checked", shown);
        });
    }

    $(".col-toggle").on("change", function () {
        const visible = $(".col-toggle:checked")
            .map(function () {
                return Number($(this).data("col"));
            })
            .get();
        localStorage.setItem("columns", JSON.stringify(visible));
    });
});

$(function () {
    const toolbar = $("#table-toolbar");
    const tableView = $("#table-view");
    const incidentForm = $("#incident-form");

    let editingIndex = null;

    const showForm = () => {
        toolbar.addClass("d-none");
        tableView.addClass("d-none");
        incidentForm.removeClass("d-none");
    };

    const showTable = () => {
        incidentForm.addClass("d-none").removeClass("was-validated");
        incidentForm[0].reset();
        editingIndex = null;
        toolbar.removeClass("d-none");
        tableView.removeClass("d-none");
    };

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
        showForm();
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
        showForm();
    });
    $("#cancel-incident").on("click", showTable);
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
        $("#table-column").toggleClass("col-sm-6 col-xxl-7");
    });

    incidentForm.on("submit", function (event) {
        event.preventDefault();
        const form = this;

        if (!form.checkValidity()) {
            $(form).addClass("was-validated");
            return;
        }

        saveIncident();
        showTable();
        renderTable();
        renderKpis();
    });

    renderTable();
    renderKpis();
});
