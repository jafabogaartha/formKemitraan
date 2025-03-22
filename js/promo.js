document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('partnership-form');
    const lokasiUsahaSelect = document.getElementById('lokasi-usaha');
    const additionalAddressDiv = document.getElementById('additional-address');
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwJeHleSLg0JQE87Oc4dwYQv509YqIFeu9FNBu6siTFoty3JGl_Q_psdqHN5MnruBs/exec';
    const minBudgetAlert = document.getElementById('min-budget-alert');
    const submitButton = document.querySelector('.submit-btn'); // Ambil referensi ke tombol submit
    const danaUsahaInput = document.getElementById('dana-usaha');

    // Daftar admin
    let adminDetails = [
        { number: '6282124952606', name: 'Admin Livia' },
        { number: '6281234086100', name: 'Admin Risma' },
        { number: '6281212125422', name: 'Admin Reka' }
    ];

    function formatRupiah(angka) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(angka);
    }

    danaUsahaInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        const numericValue = parseInt(value, 10);

        if (numericValue > 0 && numericValue < minBudgetAmount) {
            // Reset input field
            this.value = formatRupiah(minBudgetAmount);
            // Fokuskan kembali ke input field
            this.focus();
            //Display Investment Package
            minBudgetAlert.style.display = 'block';
            submitButton.disabled = true; // Disable tombol
        } else if (numericValue >= minBudgetAmount) {
            minBudgetAlert.style.display = 'none';
            submitButton.disabled = false; // Enable tombol
        } else {
            minBudgetAlert.style.display = 'none';
            submitButton.disabled = false; // Enable tombol (default)
        }
        this.value = formatRupiah(value);

    });

    lokasiUsahaSelect.addEventListener('change', () => {
        additionalAddressDiv.style.display = lokasiUsahaSelect.value === 'Sudah' ? 'block' : 'none';
    });

    // **Logika pemilihan admin yang otomatis menyesuaikan**
    function getAdminBasedOnTime() {
        const currentSecond = new Date().getSeconds();
        const adminCount = adminDetails.length;
        const timeSegment = Math.floor(60 / adminCount); // Waktu dibagi rata

        let selectedAdmin = adminDetails[adminCount - 1]; // Default admin terakhir

        for (let i = 0; i < adminCount; i++) {
            if (currentSecond < (i + 1) * timeSegment) {
                selectedAdmin = adminDetails[i];
                break;
            }
        }

        return selectedAdmin;
    }

    form.addEventListener('submit', async(e) => {
        e.preventDefault();

        if (submitButton.disabled) return; // Cek apakah tombol disabled

        submitButton.disabled = true;
        submitButton.textContent = 'Mengirim...';

        if (!danaUsahaInput.value) {
            alert('Silakan masukkan nominal dana usaha');
            submitButton.disabled = false;
            submitButton.textContent = 'Dapatkan Promo';
            return;
        }

        let danaUsahaValue = danaUsahaInput.value.replace(/[^\d]/g, '');
        let danaUsaha = parseInt(danaUsahaValue, 10);
        if (danaUsaha < minBudgetAmount) {
            submitButton.disabled = true; // Ensure button stays disabled
            submitButton.textContent = 'Dapatkan Promo';
            return;
        }

        const formData = new FormData(form);
        const nama = formData.get('nama');
        const alamat = formData.get('Alamat');
        const sumberInformasi = formData.get('sumber-informasi');
        const kendala = formData.get('Kendala');
        const keinginan = formData.get('Keinginan');
        const namaUsaha = formData.get('Nama Usaha');

        if (lokasiUsahaSelect.value === 'Belum') {
            formData.set('alamat-usaha', 'Belum Punya');
        }

        formData.set('dana-usaha', parseInt(danaUsahaInput.value.replace(/[^\d]/g, ''), 10));

        try {
            const admin = getAdminBasedOnTime();

            formData.append('admin', admin.name);
            await fetch(scriptURL, {
                method: 'POST',
                body: formData,
            });

            const waMessage = encodeURIComponent(
                `Halo kak ${admin.name}, saya ${nama} dari ${alamat}.\n\n` +
                `Saya tertarik untuk membuka usaha ${namaUsaha} dengan budget ${formatRupiah(parseInt(danaUsahaInput.value.replace(/[^\d]/g, ''), 10))}.\n` +
                `${kendala ? `\nKendala yang saya hadapi:\n${kendala}` : ''}` +
                `${keinginan ? `\n\nKeinginan saya:\n${keinginan}` : ''}` +
                `\n\nSaya mendapatkan informasi dari: ${sumberInformasi}`
            );

            const waLink = `https://wa.me/${admin.number}?text=${waMessage}`;

            window.location.href = waLink;
        } catch (error) {
            console.error('Error:', error);
            alert('Pengiriman gagal. Silakan coba lagi.');
            submitButton.disabled = false;
            submitButton.textContent = 'Dapatkan Promo';
        }
    });
});