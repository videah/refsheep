import './tailwind.css'
//import blurhashes from './blurhash-map.json';

import 'vite/types/importMeta.d';

// Prevent Vite from reloading the page since Zola is handling that.
// https://github.com/vitejs/vite/issues/6695#issuecomment-1069522995
if (import.meta.hot) {
    import.meta.hot.on('vite:beforeFullReload', () => {
        throw '(skipping full reload)';
    });
}

import "@google/model-viewer";
import "@appnest/masonry-layout";
import "blurhash-img";

import mediumZoom from 'medium-zoom'
import greenlet from "greenlet";
import copy from 'copy-to-clipboard';
// import camelcase from "camelcase";

mediumZoom('[data-zoomable]', {
    background: "#000"
})

const drawOverlay = greenlet(async (image: ImageData, color: string, tolerance: number, transparent: boolean) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    const colorToLeaveInTact = result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0];

    // Convert the image to greyscale, leaving the specified color intact
    for (let i = 0; i < image.data.length; i += 4) {
        // Check if the current pixel is within the tolerance of the color to leave intact
        if (Math.abs(image.data[i] - colorToLeaveInTact[0]) <= tolerance &&
            Math.abs(image.data[i + 1] - colorToLeaveInTact[1]) <= tolerance &&
            Math.abs(image.data[i + 2] - colorToLeaveInTact[2]) <= tolerance) {
            // Leave the pixel as is
            continue;
        }

        if (transparent) {
            // Set the pixel to transparent
            image.data[i + 3] = 0;
        } else {
            // Convert the pixel to greyscale using the average method
            const average = (image.data[i] + image.data[i + 1] + image.data[i + 2]) / 3;
            image.data[i] = average;
            image.data[i + 1] = average;
            image.data[i + 2] = average;

            // Dim the pixel by halving the intensity of each color channel
            image.data[i] = Math.floor(image.data[i] / 3);
            image.data[i + 1] = Math.floor(image.data[i + 1] / 3);
            image.data[i + 2] = Math.floor(image.data[i + 2] / 3);
        }
    }

    return image;
})

function paintOverlay(id: string, context: CanvasRenderingContext2D, refSheet: HTMLImageElement, canvasElement: HTMLCanvasElement) {
    // Draw the image onto the canvas
    context.drawImage(refSheet, 0, 0);

    // Get the image data from the canvas
    const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);

    drawOverlay(imageData, "#000", 0, false).then((imageData) => {
        context.putImageData(imageData, 0, 0);
        console.log("Image converted to greyscale");
        const overlaySheet = document.getElementById(id) as HTMLImageElement;
        overlaySheet.src = canvasElement.toDataURL()
    });
    return imageData;
}

function generatePalleteOverlays() {
    const palette = document.querySelector("#palette");
    if (palette) {
        // Get all the children of the element
        const colors = Array.from(palette.children);

        const refSheet = document.getElementById("ref-sheet") as HTMLImageElement;
        const nsfwRefSheet = document.getElementById("ref-sheet-nsfw") as HTMLImageElement;
        if (refSheet) {

            // Create a canvas element
            const canvasElement = document.createElement("canvas");
            canvasElement.width = refSheet.naturalWidth;
            canvasElement.height = refSheet.naturalHeight;

            const canvasNsfwElement = document.createElement("canvas");
            if (nsfwRefSheet) {
                canvasNsfwElement.width = nsfwRefSheet.naturalWidth;
                canvasNsfwElement.height = nsfwRefSheet.naturalHeight;
            }

            // Get the 2D drawing context from the canvas
            const context = canvasElement.getContext("2d");
            const nsfwContext = canvasNsfwElement.getContext("2d");

            if (context) {
                const imageData = paintOverlay("ref-sheet-greyscale", context, refSheet, canvasElement);
                let nsfwImageData: ImageData | undefined = undefined;

                // Do the same thing but for the NSFW sheet
                if (nsfwContext && nsfwRefSheet) {
                    nsfwImageData = paintOverlay("ref-sheet-greyscale-nsfw", nsfwContext, nsfwRefSheet, canvasNsfwElement);
                }

                const palette = document.getElementById("palette") as HTMLImageElement;
                palette.addEventListener("mouseover", () => {
                    const overlaySheet = document.getElementById("ref-sheet-greyscale") as HTMLImageElement;
                    const overlayNsfwSheet = document.getElementById("ref-sheet-greyscale-nsfw") as HTMLImageElement;
                    const slider = document.getElementById("nsfw-ref-slider") as HTMLElement;

                    const sfwSelected = slider.style.transform === "translateX(100%)" ?? true;
                    if (!sfwSelected) {
                        overlaySheet.style.opacity = "100";
                    } else {
                        overlayNsfwSheet.style.opacity = "100";
                    }
                })

                palette.addEventListener("mouseout", () => {
                    const overlaySheet = document.getElementById("ref-sheet-greyscale") as HTMLImageElement;
                    const overlayNsfwSheet = document.getElementById("ref-sheet-greyscale-nsfw") as HTMLImageElement;
                    const slider = document.getElementById("nsfw-ref-slider") as HTMLElement;

                    const sfwSelected = slider.style.transform === "translateX(100%)" ?? true;
                    if (!sfwSelected) {
                        overlaySheet.style.opacity = "0";
                    } else {
                        overlayNsfwSheet.style.opacity = "0";
                    }
                })

                // Loop over the children and attach an onmouseover event listener to each one
                for (const color of colors) {
                    // Get the color of the current element
                    const colorValue = color.getAttribute("data-color") || "#000000";

                    // Specify the tolerance for the color to leave intact
                    // e.g. a tolerance of 20 means that colors within 20 units of the specified color will be left intact
                    const colorTolerance = color.getAttribute("data-tolerance") || "20";

                    if (nsfwImageData) {
                        drawOverlay(nsfwImageData, colorValue, parseInt(colorTolerance), true).then((imageData) => {
                            if (nsfwContext) {
                                nsfwContext.putImageData(imageData, 0, 0);

                                const overlaySheet = document.getElementById("ref-sheet-".concat(colorValue).concat("-nsfw")) as HTMLImageElement;
                                overlaySheet.src = canvasNsfwElement.toDataURL()
                            }
                        });
                    }

                    drawOverlay(imageData, colorValue, parseInt(colorTolerance), true).then((imageData) => {
                        context.putImageData(imageData, 0, 0);

                        const overlaySheet = document.getElementById("ref-sheet-".concat(colorValue)) as HTMLImageElement;
                        overlaySheet.src = canvasElement.toDataURL()

                        color.addEventListener("mouseover", () => {
                            const colorValue = color.getAttribute("data-color") || "#000000";
                            const overlaySheet = document.getElementById("ref-sheet-".concat(colorValue)) as HTMLImageElement;
                            const overlayNsfwSheet = document.getElementById("ref-sheet-".concat(colorValue).concat("-nsfw")) as HTMLImageElement;
                            const slider = document.getElementById("nsfw-ref-slider") as HTMLElement;

                            const sfwSelected = slider.style.transform === "translateX(100%)" ?? true;
                            if (!sfwSelected) {
                                overlaySheet.style.opacity = "100";
                            } else {
                                overlayNsfwSheet.style.opacity = "100";
                            }
                        })

                        color.addEventListener("mouseout", () => {
                            const colorValue = color.getAttribute("data-color") || "#000000";
                            const overlaySheet = document.getElementById("ref-sheet-".concat(colorValue)) as HTMLImageElement;
                            const overlayNsfwSheet = document.getElementById("ref-sheet-".concat(colorValue).concat("-nsfw")) as HTMLImageElement;
                            const slider = document.getElementById("nsfw-ref-slider") as HTMLElement;

                            const sfwSelected = slider.style.transform === "translateX(100%)" ?? true;
                            if (!sfwSelected) {
                                overlaySheet.style.opacity = "0";
                            } else {
                                overlayNsfwSheet.style.opacity = "0";
                            }
                            const span = color.children[0] as HTMLSpanElement;
                            span.classList.add("group-hover:text-xl");
                            span.innerText = colorValue;
                        })
                    });

                    color.addEventListener("click", () => {
                        const span = color.children[0] as HTMLSpanElement;
                        span.classList.remove("group-hover:text-xl");
                        copy(colorValue);
                        span.innerText = "Copied!"
                    })
                }
            }
        }
    }
}

function unhideNSFW() {
    // Parse the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Get the value of the nsfw parameter
    const nsfw = urlParams.get('nsfw');

    // If the nsfw parameter is true, unhide all elements with the class "nsfw"
    if (nsfw) {
        // get all <a> tags with the class "card-link"
        const characters = document.querySelectorAll<HTMLLinkElement>(".card-link");
        characters.forEach((element) => {
            element.href = element.href.concat("?nsfw=true");
        });

        const nsfwToggleCard = document.getElementById("nsfw-toggle-card") as HTMLElement;
        const nsfwToggle = document.getElementById("nsfw-toggle") as HTMLInputElement;
        nsfwToggleCard.classList.remove("hidden");
        nsfwToggle.checked = true;

        const nsfwDescription = document.getElementById("nsfw-description") as HTMLElement;
        nsfwDescription.classList.remove("hidden");

        const refToggle = document.getElementById("nsfw-ref-control") as HTMLElement;
        const nsfwRefSheet = document.getElementById("ref-sheet-nsfw") as HTMLImageElement;
        if (nsfwRefSheet) refToggle.classList.remove("hidden");

        const zipButton = document.getElementById("zip-button") as HTMLLinkElement;
        const zipText = document.getElementById("zip-text") as HTMLElement;
        zipButton.href = zipButton.href.replace(".zip", "_nsfw.zip");
        zipText.innerText += " (NSFW)";

        const nsfwElements = Array.from(document.querySelectorAll<HTMLElement>(".nsfw, .nsfw-box"));
        for (const element of nsfwElements) {
            // We only want to load NSFW images if the user has explicitly checked the NSFW toggle
            const img = element.children[0] as HTMLImageElement;
            if (img) {
                img.src = img.getAttribute("data-src") || "";
            }
            element.style.display = "block";
        }
    }
}

function attachNSFWToggle() {
    const nsfwToggle = document.getElementById("nsfw-toggle") as HTMLInputElement;
    if (nsfwToggle) {
        nsfwToggle.addEventListener("change", () => {
            const nsfwElements = Array.from(document.querySelectorAll<HTMLElement>(".nsfw, .language-nsfw"));
            for (const element of nsfwElements) {
                if (nsfwToggle.checked) {
                    // We only want to load NSFW images if the user has explicitly checked the NSFW toggle
                    const img = element.children[0] as HTMLImageElement;
                    if (img) {
                        img.src = img.getAttribute("data-src") || "";
                    }
                    element.style.display = "block";
                } else {
                    element.style.display = "none";
                }
            }

            if (!nsfwToggle.checked) {
                const refSheet = document.getElementById("ref-sheet") as HTMLElement;
                const nsfwRefSheet = document.getElementById("ref-sheet-nsfw") as HTMLElement;
                const slider = document.getElementById("nsfw-ref-slider") as HTMLElement;
                const control = document.getElementById("nsfw-ref-control") as HTMLElement;
                slider.style.transform = "translateX(0px)";

                refSheet.classList.remove("hidden");
                if (nsfwRefSheet) nsfwRefSheet.classList.add("hidden");
                control.classList.add("hidden");
            } else {
                const control = document.getElementById("nsfw-ref-control") as HTMLElement;
                const nsfwRefSheet = document.getElementById("ref-sheet-nsfw") as HTMLElement;
                if (nsfwRefSheet) control.classList.remove("hidden");
            }
            const masonry = document.querySelector("masonry-layout");
            if (masonry) masonry.layout();
        });
    }
}

function renderBlurhashes() {
    const images = Array.from(document.querySelectorAll('blurhash-img'));

    for (const hash of images) {
        const width = parseInt(hash.getAttribute("data-width") || "0");
        const height = parseInt(hash.getAttribute("data-height") || "0");

        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const gcdValue = gcd(width, height);
        const aspect = `${height / gcdValue}/${width / gcdValue}`;

        hash.style.setProperty("--aspect-ratio", aspect);

        // const path = hash.getAttribute("data-path") || "";
        // const strippedPath = path.replace(/\//g, '.');
        // const finalPath = camelcase(strippedPath);

        // const json = JSON.stringify(blurhashes);
        // const decoded = JSON.parse(json);

        // const blurhash = decoded[finalPath].replace(/"/g, "");
        // hash.hash = blurhash;
        // hash.style.displaBlurhashy = "block";
    }
}

function attachRefToggleSwitch() {
    const refToggle = document.getElementById("nsfw-ref-control") as HTMLElement;
    if (refToggle) {
        refToggle.addEventListener("click", () => {
            const refSheet = document.getElementById("ref-sheet") as HTMLElement;
            const nsfwRefSheet = document.getElementById("ref-sheet-nsfw") as HTMLElement;

            const slider = document.getElementById("nsfw-ref-slider") as HTMLElement;
            const sfwSelected = slider.style.transform === "translateX(100%)" ?? true;
            slider.style.transform = sfwSelected ? "translateX(0px)" : "translateX(100%)";

            // get all ref-elements
            const refElements = Array.from(document.querySelectorAll<HTMLElement>(".ref-element"));
            const nsfwRefElements = Array.from(document.querySelectorAll<HTMLElement>(".nsfw-ref-element"));
            if (sfwSelected) {
                refSheet.classList.remove("hidden");
                if (nsfwRefSheet) nsfwRefSheet.classList.add("hidden");

                refElements.forEach((element) => {
                    element.classList.remove("hidden");
                });

                nsfwRefElements.forEach((element) => {
                    element.classList.add("hidden");
                });
            } else {
                refSheet.classList.add("hidden");
                if (nsfwRefSheet) nsfwRefSheet.classList.remove("hidden");

                refElements.forEach((element) => {
                    element.classList.add("hidden");
                });

                nsfwRefElements.forEach((element) => {
                    element.classList.remove("hidden");
                });
            }
            console.log(slider.style.transform);
        });
    }
}

window.addEventListener("load", renderBlurhashes);
window.addEventListener("load", attachNSFWToggle);
window.addEventListener("load", unhideNSFW);
window.addEventListener("load", generatePalleteOverlays);
window.addEventListener("load", attachRefToggleSwitch);