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