var jsonData = {
  HeadingName: "Blueprint Forge",
  videoList: [
    {
      title: "Blueprint Forge: A Step-by-Step How-To Video Guide",
      description:
        "Unlock innovation in minutes: Discover the swift and effortless path to crafting applications with Blueprint. Follow this <a href='https://www.youtube.com/watch?v=TpUcVjMlBxg' target='_blank' >step-by-step guide </a> to register a device with cumulocity.",
      videoUrl:
        "https://labcase.softwareag.com/storage/d/aab636eafea97add7ba211446dc9193c.mp4",
    },
    {
      title: "Predictive Maintenance with Boon Logic",
      description:
        "​​​​​​​Boon Logic is an AI software company focused on delivering the fastest anomaly detection solutions available in the market today.",
      videoUrl: "https://www.youtube.com/embed/sj54V_2B5Y4?si=HEmwhZqsn1xn5-FU",
    },
    {
      title: "Smart Field Service",
      description: "​​​​​​​Integrate Cumulocity with Field Services platform to effectively manage device malfunctions and alerts.",
      videoUrl:
        "https://labcase.softwareag.com/storage/d/62366d9ac93bcaec9558aa3c34f695e3.mp4",
    },
  ],
};
const title = document.getElementById("title");
title.insertAdjacentHTML("beforeend", jsonData.HeadingName);

console.log(jsonData);
const heading = document.getElementById("heading");
heading.insertAdjacentHTML("beforeend", jsonData.HeadingName);

const cardRow = document.getElementById("card-row");
for (let i = 0; i < jsonData.videoList.length; i++) {
  if (jsonData.videoList[i].videoUrl.split("embed").length > 1) {
    cardRow.insertAdjacentHTML(
      "beforeend",
      `<div class="col-md-6 col-sm-12 py-2" >
            <div class="card p-3"  style="height:460px">
                <h5 class="card-title" style="padding-top:10px; font-size:2.5vmin">${
                  jsonData.videoList[i].title
                }</h5>
                <div style="min-height: 8vmin; max-height:8vmin;" id="description-div-${
                  i + 1
                }">
                    <p class="card-text video-description" id="description-${
                      i + 1
                    }">${jsonData.videoList[i].description}</p>
                </div>
                <span style="padding-top: 2vh">
                    <iframe width="100%" style="height:315px" src="${
                      jsonData.videoList[i].videoUrl
                    }"></iframe>
                </span>
            </div> 
        </div>`
    );
  } else {
    cardRow.insertAdjacentHTML(
      "beforeend",
      `<div class="col-md-6 col-sm-12 py-2" >
            <div class="card p-3" style="height:460px">
                <h5 class="card-title" style="padding-top:10px; font-size:2.5vmin">${
                  jsonData.videoList[i].title
                }</h5>
                <div style="min-height: 8vmin; max-height:8vmin;" id="description-div-${
                  i + 1
                }">
                    <p class="card-text video-description" id="description-${
                      i + 1
                    }">${jsonData.videoList[i].description}</p>
                </div>
                <span style="padding-top: 2vh">
                <video width="100%" style="max-height:315px" src="${
                  jsonData.videoList[i].videoUrl
                }" controls playsinline></video> 
                </span>
            </div> 
        </div>`
    );
  }
}
