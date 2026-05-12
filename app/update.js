const ring =
  document.getElementById(
    "ring-progress"
  );

const circumference =
  2 * Math.PI * 70;

ring.style.strokeDasharray =
  circumference;

ring.style.strokeDashoffset =
  circumference;

/* Set Progress */

function setProgress(percent) {

  const offset =

    circumference -

    (percent / 100) *
    circumference;

  ring.style.strokeDashoffset =
    offset;

  document.getElementById(
    "progress-fill"
  ).style.width =

    percent + "%";

  document.getElementById(
    "progress-text"
  ).innerText =

    Math.floor(percent)
    + "%";

}

/* Messages */

window.electronAPI.onMessage(
  data => {

    /* Status */

    if (data.type === "status") {

      document.getElementById(
        "status"
      ).innerText =
        data.text;

    }

    /* Progress */

    if (data.type === "progress") {

      setProgress(
        data.percent
      );

    }

    /* Changelog */

    if (data.type === "changelog") {

      const list =
        document.getElementById(
          "changes-list"
        );

      list.innerHTML = "";

      data.items.forEach(item => {

        const li =
          document.createElement(
            "li"
          );

        li.innerText =
          item;

        list.appendChild(li);

      });

    }

  }
);