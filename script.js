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

    const showForm = () => {
        toolbar.addClass("d-none");
        tableView.addClass("d-none");
        incidentForm.removeClass("d-none");
    };

    const showTable = () => {
        incidentForm.addClass("d-none").removeClass("was-validated");
        incidentForm[0].reset();
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
        incidents.push(incident);
        localStorage.setItem("incidents", JSON.stringify(incidents));
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
        $("#preview-data thead").html(`<tr>${headerCells}</tr>`);

        if (incidents.length === 0) {
            $("#preview-data tbody").html(
                `<tr><td colspan="${visible.length || 1}" class="text-secondary">No incidents yet.</td></tr>`,
            );
            return;
        }

        const rows = incidents
            .map((incident) => {
                const cells = visible
                    .map((i) => `<td>${incident[COLUMNS[i].key]}</td>`)
                    .join("");
                return `<tr>${cells}</tr>`;
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

    $("#add-incident-btn").on("click", showForm);
    $("#cancel-incident").on("click", showTable);
    $(".col-toggle").on("change", renderTable);

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
