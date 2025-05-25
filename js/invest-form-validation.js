// Form Validation for Investment Interest Form
document.addEventListener("DOMContentLoaded", function () {
  const investmentForm = document.getElementById("bookingForm");

  if (investmentForm) {
    // Real-time validation for phone number
    const phone = document.getElementById("phone");
    if (phone) {
      phone.addEventListener("input", function () {
        validatePhone();
      });

      // Force numeric-only input
      phone.addEventListener("keypress", function (e) {
        const keyCode = e.which ? e.which : e.keyCode;
        if (keyCode < 48 || keyCode > 57) {
          e.preventDefault();
        }
      });

      // Handle paste event to strip non-numeric characters
      phone.addEventListener("paste", function (e) {
        // Get pasted data
        let pastedData = (e.clipboardData || window.clipboardData).getData(
          "text"
        );
        // Strip non-numeric characters
        pastedData = pastedData.replace(/[^0-9]/g, "");

        // Cancel the paste event and handle manually
        e.preventDefault();

        // Insert at cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(pastedData);
        range.insertNode(textNode);

        // Update input value
        this.value = this.value.replace(/[^0-9]/g, "");
        // Trigger validation
        validatePhone();
      });
    }

    // Real-time validation for full name
    const fullName = document.getElementById("fullName");
    if (fullName) {
      fullName.addEventListener("input", function () {
        validateFullName();
      });
    }

    // Real-time validation for email
    const email = document.getElementById("email");
    if (email) {
      email.addEventListener("input", function () {
        validateEmail();
      });
    }

    // Real-time validation for organization
    const organization = document.getElementById("organization");
    if (organization) {
      organization.addEventListener("input", function () {
        validateOrganization();
      });
    }

    // Real-time validation for investment goals
    const investmentGoals = document.getElementById("investmentGoals");
    if (investmentGoals) {
      investmentGoals.addEventListener("input", function () {
        validateInvestmentGoals();
      });
    }

    // Form submission
    investmentForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Clear previous error messages
      clearErrors();

      // Validate all fields before submission
      let isValid = true;

      // Validate Full Name
      if (!validateFullName()) {
        isValid = false;
      }

      // Validate Email
      if (!validateEmail()) {
        isValid = false;
      }

      // Validate Phone Number
      if (!validatePhone()) {
        isValid = false;
      }

      // Validate Organization
      if (!validateOrganization()) {
        isValid = false;
      }

      // Validate Select Fields
      if (
        !validateSelectField(
          "investorType",
          "investorTypeError",
          "Please select an investor type"
        )
      ) {
        isValid = false;
      }

      if (
        !validateSelectField(
          "interestArea",
          "interestAreaError",
          "Please select an interest area"
        )
      ) {
        isValid = false;
      }

      if (
        !validateSelectField(
          "investmentRange",
          "investmentRangeError",
          "Please select an investment range"
        )
      ) {
        isValid = false;
      }

      if (
        !validateSelectField(
          "timeframe",
          "timeframeError",
          "Please select a timeframe"
        )
      ) {
        isValid = false;
      }

      // Validate Investment Goals
      if (!validateInvestmentGoals()) {
        isValid = false;
      }

      // Validate Terms and Conditions
      const termsConditions = document.getElementById("termsConditions");
      if (!termsConditions.checked) {
        showError(
          "termsConditionsError",
          "You must agree to the Terms and Conditions"
        );
        isValid = false;
      }

      // If all validations pass
      if (isValid) {
        // Create success message if it doesn't exist
        let successMessage = document.getElementById("successMessage");
        if (!successMessage) {
          successMessage = document.createElement("div");
          successMessage.id = "successMessage";
          successMessage.className = "success-message";
          successMessage.innerHTML =
            '<i class="ri-check-line"></i> Your investment interest has been submitted successfully! Our team will contact you soon.';
          investmentForm.parentNode.insertBefore(
            successMessage,
            investmentForm
          );
        } else {
          successMessage.style.display = "flex";
        }

        // Scroll to success message
        successMessage.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Reset form after 2 seconds
        setTimeout(function () {
          investmentForm.reset();
        }, 2000);
      }
    });
  }

  // VALIDATION FUNCTIONS

  // Full Name Validation
  function validateFullName() {
    const fullName = document.getElementById("fullName");
    const value = fullName.value.trim();

    if (!value) {
      showError("fullNameError", "Please enter your full name");
      return false;
    }

    // Check name length (min 3 characters)
    if (value.length < 3) {
      showError("fullNameError", "Name must be at least 3 characters");
      return false;
    }

    // Check if name has at least 2 words (first and last name)
    const nameParts = value.split(" ").filter((part) => part.length > 0);
    if (nameParts.length < 2) {
      showError(
        "fullNameError",
        "Please enter your full name (first and last name)"
      );
      return false;
    }

    clearError("fullNameError");
    return true;
  }

  // Email Validation
  function validateEmail() {
    const email = document.getElementById("email");
    const value = email.value.trim();

    if (!value) {
      showError("emailError", "Please enter your email address");
      return false;
    }

    // Simple email validation
    if (
      value.indexOf("@") === -1 ||
      value.lastIndexOf(".") < value.indexOf("@")
    ) {
      showError("emailError", "Please enter a valid email address");
      return false;
    }

    clearError("emailError");
    return true;
  }

  // Phone Number Validation
  function validatePhone() {
    const phone = document.getElementById("phone");
    const value = phone.value.trim();

    if (!value) {
      showError("phoneError", "Please enter your phone number");
      return false;
    }

    // Check if phone contains only numbers
    if (!/^[0-9]+$/.test(value)) {
      showError("phoneError", "Phone number should contain only digits");
      return false;
    }

    // Check minimum length
    if (value.length < 8) {
      showError("phoneError", "Phone number must have at least 8 digits");
      return false;
    }

    clearError("phoneError");
    return true;
  }

  // Organization Validation
  function validateOrganization() {
    const organization = document.getElementById("organization");
    const value = organization.value.trim();

    if (!value) {
      showError("organizationError", "Please enter your organization name");
      return false;
    }

    if (value.length < 2) {
      showError(
        "organizationError",
        "Organization name must be at least 2 characters"
      );
      return false;
    }

    clearError("organizationError");
    return true;
  }

  // Investment Goals Validation
  function validateInvestmentGoals() {
    const investmentGoals = document.getElementById("investmentGoals");
    const value = investmentGoals.value.trim();

    if (!value) {
      showError(
        "investmentGoalsError",
        "Please describe your investment goals"
      );
      return false;
    }

    if (value.length < 20) {
      showError(
        "investmentGoalsError",
        "Please provide more details about your investment goals (minimum 20 characters)"
      );
      return false;
    }

    clearError("investmentGoalsError");
    return true;
  }

  // Generic Select Field Validation
  function validateSelectField(fieldId, errorId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field.value) {
      showError(errorId, errorMessage);
      return false;
    }

    clearError(errorId);
    return true;
  }

  // Helper Functions
  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";

      // Add error class to the corresponding input
      const inputId = elementId.replace("Error", "");
      const inputElement = document.getElementById(inputId);
      if (inputElement) {
        inputElement.classList.add("error");
      }
    }
  }

  function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.style.display = "none";

      // Remove error class from the corresponding input
      const inputId = elementId.replace("Error", "");
      const inputElement = document.getElementById(inputId);
      if (inputElement) {
        inputElement.classList.remove("error");
      }
    }
  }

  function clearErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach((element) => {
      element.textContent = "";
      element.style.display = "none";
    });

    // Remove error class from all inputs
    const inputElements = document.querySelectorAll("input, select, textarea");
    inputElements.forEach((element) => {
      element.classList.remove("error");
    });
  }
});
