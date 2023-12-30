const generateForm = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");


let isImageGenerating = false;
OPENAI_API_KEY = API_KEY;

const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
        const imgCard = imageGallery.querySelectorAll(".img-card")[index];
        const imgElement = imgCard.querySelector("img");
        const downloadBtn = imgCard.querySelector(".download-btn");

        //set the slot to the AI Image
        const aiGeneratedImg = `data:image/jpeg;based64,${imgObject.b64_json}`;
        imgElement.src = aiGeneratedImg;

        //remove loading screen when image is loaded
        imgElement.onload = () => {
            imgCard.classList.remove("loading");
            downloadBtn.setAttribute("href", aiGeneratedImg);
            downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
        }
    });
}

//Send requrst to OpenAI API and fatch result
const generateAiImages = async (userPrompt, userImgQuantity) => {
    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                 "Content-Type": "application/json",
                 "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                 prompt: userPrompt,
                 n: parseInt(userImgQuantity),
                 size: "512x512",
                 response_format: "b64_json"
            })
        });
        
        if(!response.ok) throw new Error("Image cannot be fetched, plaese try gain later.");

        const { data } = await response.json();
        updateImageCard([...data]);
    } catch (error) {
        console.log(error.message);
    }  finally {
        isImageGenerating = false;
    }
}

const handleFormSubmission = (e) => {
    e.preventDefault();
    if(isImageGenerating) return;
    isImageGenerating = true;

    //retrived user input
    const userPrompt = e.srcElement[0].value;
    const userImgQuantity = e.srcElement[1].value;

    //HTML markup for image in loading state
    const imgCardMarkup = Array.from({length: userImgQuantity}, () =>
        `<div class="img-card loading">
         <img src="images/loader.svg" alt="image">
         <a href="#" class="download-btn">
            <img src="images/download.svg" alt="download icon">
         </a>
        </div>`
    ).join("");

    imageGallery.innerHTML = imgCardMarkup;
    generateAiImages(userPrompt, userImgQuantity);
}

generateForm.addEventListener("submit", handleFormSubmission);