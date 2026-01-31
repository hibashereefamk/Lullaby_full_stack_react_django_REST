import Swal from 'sweetalert2';
import logo from '../assets/logo.png';

export const showAlert = (message) => {
  Swal.fire({
    // Using HTML to recreate your text logo style
    html: `
      <div>
        <img src=${logo} alt="Lullaby Logo" style="width: 140px; height: 80px; border-radius: 50%;" />
      </div>
      <div style="font-size: 16px; color: #555;">${message}</div>
    `,
    showConfirmButton: true,
    confirmButtonColor: '#111', // Matches your black 'Add to Cart' button
    confirmButtonText: 'OK',
    borderRadius: '15px',
    padding: '2rem',
  });
};