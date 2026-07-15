(() => {
  "use strict";

  const missing = (value) => value === null || value === undefined || value === "" ? "未取得" : String(value);
  const addCell = (row, value) => {
    const cell = document.createElement("td");
    cell.textContent = missing(value);
    row.appendChild(cell);
  };
  const setError = (message) => {
    document.getElementById("horse-name").textContent = "馬データを表示できません";
    document.getElementById("horse-status").hidden = false;
    document.getElementById("horse-status").innerHTML = "";
    const note = document.createElement("p");
    note.className = "notice";
    note.textContent = message;
    document.getElementById("horse-status").appendChild(note);
  };

  const token = new URLSearchParams(window.location.search).get("id") || "";
  if (!/^[0-9a-f]{16}$/.test(token)) {
    setError("馬を識別するURLが正しくありません。結果一覧から馬名をタップしてください。");
    return;
  }

  fetch(`horse_data/${token.slice(0, 2)}.json`, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((shard) => {
      const horse = shard[token];
      if (!horse) throw new Error("profile not found");
      document.title = `${missing(horse.horse_name)} | JRA予想ビュー`;
      document.getElementById("horse-name").textContent = missing(horse.horse_name);
      document.getElementById("horse-status").innerHTML = "";
      document.getElementById("horse-status").hidden = true;

      const profileSection = document.getElementById("horse-profile");
      const profileGrid = profileSection.querySelector("dl");
      const fields = [
        ["性齢", horse.sex_age], ["父", horse.sire], ["母父", horse.damsire],
        ["調教師", horse.trainer], ["脚質", horse.running_style],
        ["最新馬体重", horse.latest_body_weight], ["馬体重増減", horse.latest_body_weight_diff],
      ];
      fields.forEach(([label, value]) => {
        const wrapper = document.createElement("div");
        const term = document.createElement("dt");
        const detail = document.createElement("dd");
        term.textContent = label;
        detail.textContent = missing(value);
        wrapper.append(term, detail);
        profileGrid.appendChild(wrapper);
      });
      profileSection.hidden = false;

      const history = Array.isArray(horse.history) ? horse.history : [];
      const body = document.querySelector(".horse-history-table tbody");
      history.forEach((item) => {
        const row = document.createElement("tr");
        const condition = [item.surface, item.distance ? `${item.distance}m` : ""].filter(Boolean).join("");
        const weight = item.body_weight === "" || item.body_weight === null
          ? ""
          : `${item.body_weight}${item.body_weight_diff === "" || item.body_weight_diff === null ? "" : ` (${Number(item.body_weight_diff) >= 0 ? "+" : ""}${item.body_weight_diff})`}`;
        [
          item.date, item.racecourse, item.race_number, item.race_name, condition,
          item.going, item.horse_number, item.jockey, item.weight_carried, weight,
          item.popularity, item.win_odds, item.finish_position, item.finish_time,
          item.last_3f, item.passing_order,
        ].forEach((value) => addCell(row, value));
        body.appendChild(row);
      });
      document.getElementById("history-count").textContent = `${history.length}走`;
      document.getElementById("horse-history").hidden = false;
    })
    .catch(() => setError("保存済みの馬プロフィールが見つかりません。Pagesを再公開すると更新されます。"));
})();
