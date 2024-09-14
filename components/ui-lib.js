export function showImageModal(img) {
    showModal({
      title: Locale.Export.Image.Modal,
      children: (
        <div>
          <img
            src={img}
            alt="preview"
            style={{
              maxWidth: "100%",
            }}
          ></img>
        </div>
      ),
    });
  }