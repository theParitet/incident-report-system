$(function () {
    // theme
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


const renderColumnsPreview = (columns) => {
    
}
