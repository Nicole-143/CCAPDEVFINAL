document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('Register');

  form.addEventListener('submit', function (e) {
    const idNumber = document.getElementById('idNumber').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const userType = document.getElementById('userType').value;

    const studentEmailPattern = /^[a-z]+_[a-z]+@dlsu\.edu\.ph$/i;
    const techEmailPattern = /^[a-z]+\.[a-z]+@dlsu\.edu\.ph$/i;

    if (!/^12\d{6}$/.test(idNumber)) {
      e.preventDefault();
      alert('ID number must start with "12" and be 8 digits long.');
      return;
    }

    if (
      (userType === 'student' && !studentEmailPattern.test(email)) ||
      (userType === 'technician' && !techEmailPattern.test(email))
    ) {
      e.preventDefault();
      alert('Please enter a valid DLSU email address based on your account type.');
     return;
    }

    if (password !== confirmPassword) {
      e.preventDefault();
      alert('Passwords do not match.');
      return;
      
    }
  });
});
