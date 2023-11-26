document.addEventListener("DOMContentLoaded", function () {
    const inputFields = document.getElementById('inputFields');
    const generateComic = document.getElementById('generateComic');
    const addAnnotationsButton = document.getElementById('addAnnotations');
    const comicStrip = document.querySelector('.comic-strip');
    
    // Add 10 input fields and textareas
    for (let i = 1; i <= 10; i++) {
        let input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Panel ${i} Text`;
        input.id = `panel${i}`;
        inputFields.appendChild(input);

        let textarea = document.createElement('textarea');
        textarea.placeholder = `Panel ${i} Annotations`;
        textarea.id = `annotation${i}`;
        inputFields.appendChild(textarea);
    }

    generateComic.addEventListener('click', async function () {
        comicStrip.innerHTML = ''; // Clear previous comics
        for (let i = 1; i <= 10; i++) {
            let text = document.getElementById(`panel${i}`).value;
            let annotations = document.getElementById(`annotation${i}`).value;
            if (text) {
                await fetchComicPanel(text, annotations, i);
            }
        }
    });

    addAnnotationsButton.addEventListener('click', function () {
        // Implement logic to add annotations to comic panels using Fabric.js
        const comicPanels = document.querySelectorAll('.comicPanel');

        comicPanels.forEach((panel, index) => {
            const annotationText = document.getElementById(`annotation${index + 1}`).value;

            // Create Fabric.js canvas for each panel
            const canvas = new fabric.Canvas(`canvas-${index + 1}`, {
                width: panel.width,
                height: panel.height,
            });

            // Add the image to the canvas
            const img = new fabric.Image(panel, {
                selectable: false,
            });
            canvas.add(img);

            // Add text annotation to the canvas
            const text = new fabric.Text(annotationText, {
                left: 10,
                top: 10,
                fontSize: 20,
                fill: 'white', // Set the color of the text
            });
            canvas.add(text);
        });
    });

    async function fetchComicPanel(text, annotations, panelNumber) {
        try {
            const imageData = await query({ "inputs": text });
            if (!imageData) {
                console.error('No image data returned from the API for panel number ' + panelNumber);
                // Handle error or provide user feedback
                return;
            }
            const url = URL.createObjectURL(imageData);
    
            // Create a container for the image and annotations
            let panelContainer = document.createElement('div');
            panelContainer.classList.add('panel-container');
    
            // Create an image element
            let img = document.createElement('img');
            img.src = url;
            img.classList.add('comicPanel');
    
            // Create a div for annotations and append it below the image
            let annotationDiv = document.createElement('div');
            annotationDiv.classList.add('annotation');
            annotationDiv.textContent = annotations;
            panelContainer.appendChild(img);
            panelContainer.appendChild(annotationDiv);
    
            // Clean up the object URL after loading
            img.onload = () => URL.revokeObjectURL(url);
            
            // Append the panel container to the comic strip
            comicStrip.appendChild(panelContainer);
    
        } catch (error) {
            console.error('Error fetching comic panel number ' + panelNumber + ':', error);
            // Handle error or provide user feedback
        }
    }

    async function query(data) {
        try {
            const response = await fetch(
                "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
                {
                    headers: {
                        "Accept": "image/png",
                        "Authorization": "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM",
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify(data),
                }
            );
            if (response.ok) {
                const result = await response.blob();
                console.log('API call successful, received blob:', result);
                return result;
            } else {
                // The API call was made but the server response was not OK.
                console.error('API call failed:', response.status, response.statusText);
                return null;
            }
        } catch (error) {
            // The fetch failed, meaning there was no response (e.g., network error).
            console.error('API call error:', error);
            return null;
        }
    }
});
