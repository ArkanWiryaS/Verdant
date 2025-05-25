// Form Validation for Booking Form
document.addEventListener("DOMContentLoaded", function () {
  const bookingForm = document.getElementById("bookingForm");

  if (bookingForm) {
    // Real-time validation for departure date (should be at least tomorrow)
    const departureDate = document.getElementById("departureDate");
    if (departureDate) {
      departureDate.addEventListener("change", function () {
        validateDepartureDate();
      });

      // Set minimum departure date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = tomorrow.toISOString().split("T")[0];
      departureDate.setAttribute("min", tomorrowFormatted);
    }

    // Real-time validation for return date (should be after departure date)
    const returnDate = document.getElementById("returnDate");
    if (returnDate && departureDate) {
      returnDate.addEventListener("change", function () {
        validateReturnDate();
      });

      departureDate.addEventListener("change", function () {
        // When departure date changes, update min attribute of return date
        if (departureDate.value) {
          const nextDay = new Date(departureDate.value);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayFormatted = nextDay.toISOString().split("T")[0];
          returnDate.setAttribute("min", nextDayFormatted);
        }
      });
    }

    // Real-time validation for participants
    const participants = document.getElementById("participants");
    if (participants) {
      participants.addEventListener("input", function () {
        validateParticipants();
      });
    }

    // Real-time validation for phone number
    const phone = document.getElementById("phone");
    if (phone) {
      phone.addEventListener("input", function () {
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

    // Form submission
    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Clear previous error messages
      clearErrors();

      // Validate all fields before submission
      let isValid = true;

      // 1. Nama lengkap validation (minimal 3 kata, tidak boleh angka)
      if (!validateFullName()) {
        isValid = false;
      }

      // 2. Email validation (tanpa regex)
      if (!validateEmail()) {
        isValid = false;
      }

      // 3. Nomor telepon validation (hanya angka, minimal 10 digit)
      if (!validatePhone()) {
        isValid = false;
      }

      // 4. Number of participants validation (1-20 orang)
      if (!validateParticipants()) {
        isValid = false;
      }

      // 5. Destination validation
      const destination = document.getElementById("destination");
      if (!destination.value) {
        showError("destinationError", "Silakan pilih destinasi perjalanan");
        isValid = false;
      }

      // Package Type validation
      const packageType = document.getElementById("packageType");
      if (!packageType.value) {
        showError("packageTypeError", "Silakan pilih jenis paket perjalanan");
        isValid = false;
      }

      // 6. Departure date validation (minimal hari besok)
      if (!validateDepartureDate()) {
        isValid = false;
      }

      // 7. Return date validation (setelah tanggal keberangkatan, maksimal 30 hari)
      if (!validateReturnDate()) {
        isValid = false;
      }

      // 8. Terms and conditions validation
      const termsConditions = document.getElementById("termsConditions");
      if (!termsConditions.checked) {
        showError(
          "termsConditionsError",
          "Anda harus menyetujui syarat dan ketentuan"
        );
        isValid = false;
      }

      // If all validations pass
      if (isValid) {
        // Show success message and could submit the form
        alert(
          "Booking berhasil! Kami akan segera menghubungi Anda untuk konfirmasi pemesanan."
        );
        bookingForm.reset();
      }
    });
  }

  // VALIDATION FUNCTIONS

  // 1. Full Name Validation - at least 3 characters, no numbers
  function validateFullName() {
    const fullName = document.getElementById("fullName");
    const value = fullName.value.trim();

    if (!value) {
      showError("fullNameError", "Silakan masukkan nama lengkap Anda");
      return false;
    }

    // Check if name contains numbers
    for (let i = 0; i < value.length; i++) {
      if (!isNaN(parseInt(value[i])) && value[i] !== " ") {
        showError("fullNameError", "Nama tidak boleh mengandung angka");
        return false;
      }
    }

    // Check name length (min 3 characters)
    if (value.length < 3) {
      showError("fullNameError", "Nama harus minimal 3 karakter");
      return false;
    }

    // Check if name has at least 2 words (first and last name)
    const nameParts = value.split(" ").filter((part) => part.length > 0);
    if (nameParts.length < 2) {
      showError(
        "fullNameError",
        "Harap masukkan nama lengkap (minimal nama depan dan belakang)"
      );
      return false;
    }

    clearError("fullNameError");
    return true;
  }

  // 2. Email Validation without regex
  function validateEmail() {
    const email = document.getElementById("email");
    const value = email.value.trim();

    if (!value) {
      showError("emailError", "Silakan masukkan alamat email Anda");
      return false;
    }

    // Check if email has @ symbol
    if (value.indexOf("@") === -1) {
      showError("emailError", "Email harus mengandung simbol @");
      return false;
    }

    // Check if there's text before and after @
    const parts = value.split("@");
    if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
      showError("emailError", "Format email tidak valid");
      return false;
    }

    // Check if domain has at least one dot
    if (parts[1].indexOf(".") === -1) {
      showError("emailError", "Domain email harus mengandung titik (.)");
      return false;
    }

    // Check if there's text after the last dot
    const domainParts = parts[1].split(".");
    if (domainParts[domainParts.length - 1].length === 0) {
      showError("emailError", "Format email tidak valid");
      return false;
    }

    clearError("emailError");
    return true;
  }

  // 3. Phone Number Validation - only numbers, min 10 digits
  function validatePhone() {
    const phone = document.getElementById("phone");
    const value = phone.value.trim();

    if (!value) {
      showError("phoneError", "Silakan masukkan nomor telepon Anda");
      return false;
    }

    // Check if phone contains only numbers
    for (let i = 0; i < value.length; i++) {
      if (
        isNaN(parseInt(value[i])) &&
        value[i] !== "+" &&
        value[i] !== "-" &&
        value[i] !== " "
      ) {
        showError(
          "phoneError",
          "Nomor telepon hanya boleh berisi angka, +, -, atau spasi"
        );
        return false;
      }
    }

    // Count only digits in the phone number
    let digitCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (!isNaN(parseInt(value[i]))) {
        digitCount++;
      }
    }

    // Check minimum digits
    if (digitCount < 10) {
      showError("phoneError", "Nomor telepon harus minimal 10 digit");
      return false;
    }

    clearError("phoneError");
    return true;
  }

  // 4. Participants Validation - 1-20 persons
  function validateParticipants() {
    const participants = document.getElementById("participants");
    const value = participants.value;

    if (!value) {
      showError("participantsError", "Silakan masukkan jumlah peserta");
      return false;
    }

    const numParticipants = parseInt(value);
    if (isNaN(numParticipants)) {
      showError("participantsError", "Jumlah peserta harus berupa angka");
      return false;
    }

    if (numParticipants < 1) {
      showError("participantsError", "Minimal 1 peserta");
      return false;
    }

    if (numParticipants > 20) {
      showError(
        "participantsError",
        "Maksimal 20 peserta. Untuk grup lebih besar, silakan hubungi kami"
      );
      return false;
    }

    clearError("participantsError");
    return true;
  }

  // 5. Departure Date Validation - minimum tomorrow
  function validateDepartureDate() {
    const departureDate = document.getElementById("departureDate");

    if (!departureDate.value) {
      showError("departureDateError", "Silakan pilih tanggal keberangkatan");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(departureDate.value);
    selectedDate.setHours(0, 0, 0, 0);

    // Ensure departure date is at least tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (selectedDate < tomorrow) {
      showError(
        "departureDateError",
        "Tanggal keberangkatan minimal H+1 dari hari ini"
      );
      return false;
    }

    // Ensure departure date is not too far in the future (e.g., max 1 year)
    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    if (selectedDate > maxDate) {
      showError(
        "departureDateError",
        "Tanggal keberangkatan maksimal 1 tahun dari sekarang"
      );
      return false;
    }

    clearError("departureDateError");
    return true;
  }

  // 6. Return Date Validation - after departure date
  function validateReturnDate() {
    const departureDate = document.getElementById("departureDate");
    const returnDate = document.getElementById("returnDate");

    if (!returnDate.value) {
      showError("returnDateError", "Silakan pilih tanggal kembali");
      return false;
    }

    if (!departureDate.value) {
      showError(
        "returnDateError",
        "Silakan pilih tanggal keberangkatan terlebih dahulu"
      );
      return false;
    }

    const departureValue = new Date(departureDate.value);
    const returnValue = new Date(returnDate.value);

    // Check if return date is after departure date
    if (returnValue <= departureValue) {
      showError(
        "returnDateError",
        "Tanggal kembali harus setelah tanggal keberangkatan"
      );
      return false;
    }

    // Check if trip duration is not too long (e.g., max 30 days)
    const tripDuration = Math.floor(
      (returnValue - departureValue) / (1000 * 60 * 60 * 24)
    );
    if (tripDuration > 30) {
      showError(
        "returnDateError",
        "Durasi perjalanan maksimal 30 hari. Untuk perjalanan lebih lama, silakan hubungi kami"
      );
      return false;
    }

    clearError("returnDateError");
    return true;
  }

  // Helper functions
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
