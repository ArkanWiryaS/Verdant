document.addEventListener("DOMContentLoaded", function () {
  const investmentForm = document.getElementById("bookingForm");

  if (investmentForm) {
    const phone = document.getElementById("phone");
    if (phone) {
      phone.addEventListener("input", function () {
        validatePhone();
      });

      phone.addEventListener("keypress", function (e) {
        const keyCode = e.which ? e.which : e.keyCode;
        if (keyCode < 48 || keyCode > 57) {
          e.preventDefault();
        }
      });

      phone.addEventListener("paste", function (e) {
        let pastedData = (e.clipboardData || window.clipboardData).getData(
          "text"
        );
        pastedData = pastedData.replace(/[^0-9]/g, "");

        e.preventDefault();

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(pastedData);
        range.insertNode(textNode);

        this.value = this.value.replace(/[^0-9]/g, "");
        validatePhone();
      });
    }

    const fullName = document.getElementById("fullName");
    if (fullName) {
      fullName.addEventListener("input", function () {
        validateFullName();
      });
    }

    const email = document.getElementById("email");
    if (email) {
      email.addEventListener("input", function () {
        validateEmail();
      });
    }

    const organization = document.getElementById("organization");
    if (organization) {
      organization.addEventListener("input", function () {
        validateOrganization();
      });
    }

    const investmentGoals = document.getElementById("investmentGoals");
    if (investmentGoals) {
      investmentGoals.addEventListener("input", function () {
        validateInvestmentGoals();
      });
    }

    investmentForm.addEventListener("submit", function (event) {
      event.preventDefault();

      clearErrors();

      let isValid = true;

      if (!validateFullName()) {
        isValid = false;
      }

      if (!validateEmail()) {
        isValid = false;
      }

      if (!validatePhone()) {
        isValid = false;
      }

      if (!validateOrganization()) {
        isValid = false;
      }

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

      if (!validateInvestmentGoals()) {
        isValid = false;
      }

      const termsConditions = document.getElementById("termsConditions");
      if (!termsConditions.checked) {
        showError(
          "termsConditionsError",
          "You must agree to the Terms and Conditions"
        );
        isValid = false;
      }

      if (isValid) {
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

        successMessage.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setTimeout(function () {
          investmentForm.reset();
        }, 2000);
      }
    });
  }

  function validateFullName() {
    const fullName = document.getElementById("fullName");
    const value = fullName.value.trim();

    if (!value) {
      showError("fullNameError", "Please enter your full name");
      return false;
    }

    if (value.length < 3) {
      showError("fullNameError", "Name must be at least 3 characters");
      return false;
    }

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

  function validateEmail() {
    const email = document.getElementById("email");
    const value = email.value.trim();

    if (!value) {
      showError("emailError", "Please enter your email address");
      return false;
    }

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

  function validatePhone() {
    const phone = document.getElementById("phone");
    const value = phone.value.trim();

    if (!value) {
      showError("phoneError", "Please enter your phone number");
      return false;
    }

    if (!/^[0-9]+$/.test(value)) {
      showError("phoneError", "Phone number should contain only digits");
      return false;
    }

    if (value.length < 8) {
      showError("phoneError", "Phone number must have at least 8 digits");
      return false;
    }

    clearError("phoneError");
    return true;
  }

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

  function validateSelectField(fieldId, errorId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field.value) {
      showError(errorId, errorMessage);
      return false;
    }

    clearError(errorId);
    return true;
  }

  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";

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

    const inputElements = document.querySelectorAll("input, select, textarea");
    inputElements.forEach((element) => {
      element.classList.remove("error");
    });
  }
});
