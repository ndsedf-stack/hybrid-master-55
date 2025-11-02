// ==================================
// EXPORT / IMPORT LOCAL FILES
// ==================================
import { saveData, loadData } from "./local-storage.js";

export function exportToFile() {
  const data = loadData();
  if (!data) {
    alert("Aucune donnée à exporter.");
    return;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "hybrid-master-51-save.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      saveData(data);
      alert("Importation réussie ✅");
    } catch {
      alert("Erreur d’importation ❌");
    }
  };
  reader.readAsText(file);
}
