// api/dispositivo.js
//
// Função serverless da Vercel. Recebe um comando do site (ex: "ligar a
// TV da Sala de Descanso") e publica isso como uma mensagem MQTT no
// HiveMQ Cloud. O dispositivo real (tomada com Tasmota) já está
// "escutando" esse mesmo tópico e executa o comando na hora.
//
// As credenciais NUNCA ficam aqui no código — vêm das variáveis de
// ambiente configuradas no painel do Vercel (Settings > Environment
// Variables): MQTT_HOST, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD.

const mqtt = require("mqtt");

// Mapa de "qual botão do site" -> "qual tópico MQTT" o dispositivo
// real está escutando. Edite/complete conforme for configurando cada
// tomada com Tasmota. O padrão do Tasmota costuma ser:
//   cmnd/<nome-do-dispositivo>/POWER
// e os valores aceitos são "ON" e "OFF".
const DEVICE_TOPICS = {
  "descanso-tv": "cmnd/descanso-tv/POWER",
  "descanso-sala": "cmnd/descanso-luz/POWER",
  "veritas-tv": "cmnd/veritas-tv/POWER",
  "veritas-sala": "cmnd/veritas-luz/POWER",
  "controle-tv": "cmnd/controle-tv/POWER",
  "controle-sala": "cmnd/controle-luz/POWER",
  "controle-totem": "cmnd/controle-totem/POWER",
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ erro: "Use POST" });
    return;
  }

  try {
    const { dispositivo, ligar } = req.body || {};

    if (!dispositivo || typeof ligar !== "boolean") {
      res.status(400).json({
        erro: "Envie 'dispositivo' (string) e 'ligar' (true/false) no corpo da requisição.",
      });
      return;
    }

    const topic = DEVICE_TOPICS[dispositivo];
    if (!topic) {
      res.status(404).json({ erro: `Dispositivo '${dispositivo}' não configurado em DEVICE_TOPICS.` });
      return;
    }

    const host = process.env.MQTT_HOST;
    const port = process.env.MQTT_PORT || "8883";
    const username = process.env.MQTT_USERNAME;
    const password = process.env.MQTT_PASSWORD;

    if (!host || !username || !password) {
      res.status(500).json({ erro: "Variáveis de ambiente do MQTT não configuradas no Vercel." });
      return;
    }

    const client = mqtt.connect(`mqtts://${host}:${port}`, {
      username,
      password,
      connectTimeout: 8000,
      reconnectPeriod: 0, // não tentar reconectar, é só uma chamada rápida
    });

    const resultado = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        client.end(true);
        reject(new Error("Tempo esgotado ao conectar no broker MQTT."));
      }, 8000);

      client.on("connect", () => {
        client.publish(topic, ligar ? "ON" : "OFF", { qos: 1 }, (err) => {
          clearTimeout(timeout);
          client.end();
          if (err) reject(err);
          else resolve({ topic, valor: ligar ? "ON" : "OFF" });
        });
      });

      client.on("error", (err) => {
        clearTimeout(timeout);
        client.end(true);
        reject(err);
      });
    });

    res.status(200).json({ sucesso: true, ...resultado });
  } catch (err) {
    console.error("Erro na função /api/dispositivo:", err);
    res.status(500).json({ erro: "Falha ao enviar comando pro dispositivo.", detalhe: String(err.message || err) });
  }
};
