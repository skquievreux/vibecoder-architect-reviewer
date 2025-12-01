
const dagre = require('dagre');
try {
    const g = new dagre.graphlib.Graph();
    console.log("Dagre works!");
} catch (e) {
    console.error("Dagre failed:", e);
}
