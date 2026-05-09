window.electronAPI.onMessage(
  data => {

    if (data.type === "status") {

      document.getElementById(
        "status"
      ).innerText = data.text;
    }

    if (data.type === "progress") {

      document.getElementById(
        "progress-fill"
      ).style.width =
        data.percent + "%";

      document.getElementById(
        "progress-text"
      ).innerText =
        Math.floor(data.percent)
        + "%";
    }

    if (data.type === "changelog") {

      const list =
        document.getElementById(
          "changes-list"
        );

      list.innerHTML = "";

      data.items.forEach(item => {

        const li =
          document.createElement("li");

        li.innerText = item;

        list.appendChild(li);

      });

    }

  }
);