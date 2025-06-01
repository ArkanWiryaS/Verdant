document.addEventListener("DOMContentLoaded", function () {
  const homeSearchForm = document.getElementById("homeSearchForm");

  if (homeSearchForm) {
    const sectorSelect = homeSearchForm.querySelector("select");
    sectorSelect.id = "homeSector";

    const projectTypeSelect = homeSearchForm.querySelectorAll("select")[1];
    projectTypeSelect.id = "homeProjectType";

    const regionSelect = homeSearchForm.querySelectorAll("select")[2];
    regionSelect.id = "homeRegion";

    const formGroups = homeSearchForm.querySelectorAll(".form__group");

    formGroups.forEach((group) => {
      const errorSpan = document.createElement("span");
      errorSpan.className = "error-message";

      if (
        group.querySelector("select") &&
        group.querySelector("select").id === "homeSector"
      ) {
        errorSpan.id = "homeSectorError";
      } else if (
        group.querySelector("select") &&
        group.querySelector("select").id === "homeProjectType"
      ) {
        errorSpan.id = "homeProjectTypeError";
      } else if (
        group.querySelector("select") &&
        group.querySelector("select").id === "homeRegion"
      ) {
        errorSpan.id = "homeRegionError";
      }

      group.appendChild(errorSpan);
    });

    const style = document.createElement("style");
    style.textContent = `
      .error-message {
        color: #e53935;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
      }
      
      .booking__form .form__group {
        position: relative;
      }
    `;
    document.head.appendChild(style);

    homeSearchForm.addEventListener("submit", function (event) {
      event.preventDefault();

      clearErrors();

      let isValid = true;

      if (sectorSelect.value === "Select Sector") {
        showError("homeSectorError", "Please select an industry sector");
        isValid = false;
      }

      if (!projectTypeSelect.value) {
        showError("homeProjectTypeError", "Please select a project type");
        isValid = false;
      }

      if (!regionSelect.value) {
        showError("homeRegionError", "Please select a region");
        isValid = false;
      }

      if (isValid) {
        alert(
          "Search submitted successfully! We'll find the best innovation projects for you."
        );
      }
    });
  }

  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach((element) => {
      element.textContent = "";
    });
  }
});
