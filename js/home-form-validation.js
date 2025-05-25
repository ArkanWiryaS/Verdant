// Form Validation for Home Page Search Form
document.addEventListener("DOMContentLoaded", function() {
  const homeSearchForm = document.getElementById("homeSearchForm");
  
  if (homeSearchForm) {
    // Add ids to form elements for easier access
    const sectorSelect = homeSearchForm.querySelector("select");
    sectorSelect.id = "homeSector";
    
    const projectTypeSelect = homeSearchForm.querySelectorAll("select")[1];
    projectTypeSelect.id = "homeProjectType";
    
    const regionSelect = homeSearchForm.querySelectorAll("select")[2];
    regionSelect.id = "homeRegion";
    
    // Add error message elements
    const formGroups = homeSearchForm.querySelectorAll(".form__group");
    
    formGroups.forEach(group => {
      const errorSpan = document.createElement("span");
      errorSpan.className = "error-message";
      
      if (group.querySelector("select") && group.querySelector("select").id === "homeSector") {
        errorSpan.id = "homeSectorError";
      } else if (group.querySelector("select") && group.querySelector("select").id === "homeProjectType") {
        errorSpan.id = "homeProjectTypeError";
      } else if (group.querySelector("select") && group.querySelector("select").id === "homeRegion") {
        errorSpan.id = "homeRegionError";
      }
      
      group.appendChild(errorSpan);
    });
    
    // Style for error messages
    const style = document.createElement('style');
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
    
    homeSearchForm.addEventListener("submit", function(event) {
      event.preventDefault();
      
      // Clear previous error messages
      clearErrors();
      
      // Validate required fields
      let isValid = true;
      
      // Sector validation
      if (sectorSelect.value === "Select Sector") {
        showError("homeSectorError", "Please select an industry sector");
        isValid = false;
      }
      
      // Project type validation
      if (!projectTypeSelect.value) {
        showError("homeProjectTypeError", "Please select a project type");
        isValid = false;
      }
      
      // Region validation
      if (!regionSelect.value) {
        showError("homeRegionError", "Please select a region");
        isValid = false;
      }
      
      // If all validations pass
      if (isValid) {
        // Show success message
        alert("Search submitted successfully! We'll find the best innovation projects for you.");
        // Here you would typically proceed with the search or redirection
      }
    });
  }
  
  // Helper functions
  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }
  
  function clearErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach(element => {
      element.textContent = "";
    });
  }
}); 