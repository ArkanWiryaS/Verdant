document.addEventListener("DOMContentLoaded", function () {
  const bookingForm = document.getElementById("bookingForm");

  if (bookingForm) {
    const departureDate = document.getElementById("departureDate");
    if (departureDate) {
      departureDate.addEventListener("change", function () {
        validateDepartureDate();
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = tomorrow.toISOString().split("T")[0];
      departureDate.setAttribute("min", tomorrowFormatted);
    }

    const returnDate = document.getElementById("returnDate");
    if (returnDate && departureDate) {
      returnDate.addEventListener("change", function () {
        validateReturnDate();
      });

      departureDate.addEventListener("change", function () {
        if (departureDate.value) {
          const nextDay = new Date(departureDate.value);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayFormatted = nextDay.toISOString().split("T")[0];
          returnDate.setAttribute("min", nextDayFormatted);
        }
      });
    }

    const participants = document.getElementById("participants");
    if (participants) {
      participants.addEventListener("input", function () {
        validateParticipants();
      });
    }

    const phone = document.getElementById("phone");
    if (phone) {
      phone.addEventListener("input", function () {
        validatePhone();
      });
    }

    const fullName = document.getElementById("fullName");
    if (fullName) {
      fullName.addEventListener("input", function () {
        validateFullName();
      });
    }

    bookingForm.addEventListener("submit", function (event) {
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

      if (!validateParticipants()) {
        isValid = false;
      }

      const destination = document.getElementById("destination");
      if (!destination.value) {
        showError("destinationError", "Silakan pilih destinasi perjalanan");
        isValid = false;
      }

      const packageType = document.getElementById("packageType");
      if (!packageType.value) {
        showError("packageTypeError", "Silakan pilih jenis paket perjalanan");
        isValid = false;
      }

      if (!validateDepartureDate()) {
        isValid = false;
      }

      if (!validateReturnDate()) {
        isValid = false;
      }

      const termsConditions = document.getElementById("termsConditions");
      if (!termsConditions.checked) {
        showError(
          "termsConditionsError",
          "Anda harus menyetujui syarat dan ketentuan"
        );
        isValid = false;
      }

      if (isValid) {
        alert(
          "Booking berhasil! Kami akan segera menghubungi Anda untuk konfirmasi pemesanan."
        );
        bookingForm.reset();
      }
    });
  }

  function validateFullName() {
    const fullName = document.getElementById("fullName");
    const value = fullName.value.trim();

    if (!value) {
      showError("fullNameError", "Silakan masukkan nama lengkap Anda");
      return false;
    }

    for (let i = 0; i < value.length; i++) {
      if (!isNaN(parseInt(value[i])) && value[i] !== " ") {
        showError("fullNameError", "Nama tidak boleh mengandung angka");
        return false;
      }
    }

    if (value.length < 3) {
      showError("fullNameError", "Nama harus minimal 3 karakter");
      return false;
    }

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

  function validateEmail() {
    const email = document.getElementById("email");
    const value = email.value.trim();

    if (!value) {
      showError("emailError", "Silakan masukkan alamat email Anda");
      return false;
    }

    if (value.indexOf("@") === -1) {
      showError("emailError", "Email harus mengandung simbol @");
      return false;
    }

    const parts = value.split("@");
    if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
      showError("emailError", "Format email tidak valid");
      return false;
    }

    if (parts[1].indexOf(".") === -1) {
      showError("emailError", "Domain email harus mengandung titik (.)");
      return false;
    }

    const domainParts = parts[1].split(".");
    if (domainParts[domainParts.length - 1].length === 0) {
      showError("emailError", "Format email tidak valid");
      return false;
    }

    clearError("emailError");
    return true;
  }

  function validatePhone() {
    const phone = document.getElementById("phone");
    const value = phone.value.trim();

    if (!value) {
      showError("phoneError", "Silakan masukkan nomor telepon Anda");
      return false;
    }

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

    let digitCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (!isNaN(parseInt(value[i]))) {
        digitCount++;
      }
    }

    if (digitCount < 10) {
      showError("phoneError", "Nomor telepon harus minimal 10 digit");
      return false;
    }

    clearError("phoneError");
    return true;
  }

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

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (selectedDate < tomorrow) {
      showError(
        "departureDateError",
        "Tanggal keberangkatan minimal H+1 dari hari ini"
      );
      return false;
    }

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

    if (returnValue <= departureValue) {
      showError(
        "returnDateError",
        "Tanggal kembali harus setelah tanggal keberangkatan"
      );
      return false;
    }

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
