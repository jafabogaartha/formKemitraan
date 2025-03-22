// Pastikan script.js di-load setelah deklarasi minimumDana di HTML

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('partnership-form');
    const lokasiUsahaSelect = document.getElementById('lokasi-usaha');
    const additionalAddressDiv = document.getElementById('additional-address');
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwJeHleSLg0JQE87Oc4dwYQv509YqIFeu9FNBu6siTFoty3JGl_Q_psdqHN5MnruBs/exec';
    const danaUsahaInput = document.getElementById('dana-usaha');
    const danaUsahaError = document.getElementById('dana-usaha-error');

    // Daftar admin
    const adminDetails = [
        { number: '6282124952606', name: 'Admin Livia' },
        { number: '6281234086100', name: 'Admin Risma' },
        { number: '6281212125422', name: 'Admin Reka' }
    ];

    function formatRupiah(angka) {
        const numberFormat = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        return numberFormat.format(angka);
    }

    danaUsahaInput.addEventListener('input', function () {
        let value = this.value.replace(/\D/g, '');
        const numericValue = parseInt(value, 10) || 0;

        this.value = formatRupiah(value);

        if (numericValue < minimumDana && numericValue > 0) {
            danaUsahaError.style.display = 'block';
        } else {
            danaUsahaError.style.display = 'none';
        }
    });

    lokasiUsahaSelect.addEventListener('change', () => {
        additionalAddressDiv.style.display = lokasiUsahaSelect.value === 'Sudah' ? 'block' : 'none';
    });

    function getAdminBasedOnTime() {
        const currentSecond = new Date().getSeconds();
        if (currentSecond >= 1 && currentSecond <= 15) {
            return adminDetails[0]; // Admin Livia
        } else if (currentSecond >= 16 && currentSecond <= 30) {
            return adminDetails[1]; // Admin Berlian
        } else if (currentSecond >= 31 && currentSecond <= 45) {
            return adminDetails[2]; // Admin Risma
        } else {
            return adminDetails[3]; // Admin Reka
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = document.querySelector('.submit-btn');
        if (submitButton.disabled) return;
        submitButton.disabled = true;
        submitButton.textContent = 'Mengirim...';

        if (!danaUsahaInput.value) {
            alert('Silakan masukkan nominal dana usaha');
            submitButton.disabled = false;
            submitButton.textContent = 'Hubungi Admin di WhatsApp';
            return;
        }

        const numericDana = parseInt(danaUsahaInput.value.replace(/[^\d]/g, ''), 10) || 0;
        if (numericDana < minimumDana) {
            danaUsahaError.style.display = 'block';
            alert('Dana usaha kurang dari minimum yang disyaratkan.');
            submitButton.disabled = false;
            submitButton.textContent = 'Hubungi Admin di WhatsApp';
            return;
        } else {
            danaUsahaError.style.display = 'none';
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

        formData.set('dana-usaha', numericDana);

        try {
            const admin = getAdminBasedOnTime();

            formData.append('admin', admin.name);
            await fetch(scriptURL, {
                method: 'POST',
                body: formData,
            });

            const waMessage = encodeURIComponent(
                `Halo kak ${admin.name}, saya ${nama} dari ${alamat}.\n\n` +
                `Saya tertarik untuk membuka usaha ${namaUsaha} dengan budget ${formatRupiah(numericDana)}.\n` +
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
            submitButton.textContent = 'Hubungi Admin di WhatsApp';
        }
    });
});