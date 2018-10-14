const LONELY_PLANET_BASE_URL =
    process.env.PRODUCER_LONELY_PLANET_BASE_URL ? process.env.PRODUCER_LONELY_PLANET_BASE_URL : "https://www.lonelyplanet.com/";

const APP_VERSION =
    process.env.APP_VERSION ? process.env.APP_VERSION : "0.1.0";

const APP_NAME =
    process.env.APP_NAME ? process.env.APP_NAME : "triplan-scrapper";

const TOPIC_NAME =
    process.env.PRODUCER_KAFKA_COUNTRY_TOPIC_NAME
        ? process.env.PRODUCER_KAFKA_COUNTRY_TOPIC_NAME
        : "test1";

const COUNTRY_JSON_DATA_FILE =
    process.env.PRODUCER_COUNTRY_JSON_DATA_FILE
        ? process.env.PRODUCER_COUNTRY_JSON_DATA_FILE
        : "/app/node_modules/country-json/src/country-by-name.json"

const KAFKA_RETRY_ATTEMPTS = 1

const KAFKA_BROKER_IP =
    (process.env.KAFKA_BROKER_IP ? process.env.KAFKA_BROKER_IP : "192.168.0.54")
    + ':' + 
    (process.env.KAFKA_BROKER_PORT ? process.env.KAFKA_BROKER_PORT : "9092");

var kafka = require('kafka-node')
var Producer = kafka.Producer
var KeyedMessage = kafka.KeyedMessage;
 
// from the Oracle Event Hub - Platform Cluster Connect Descriptor
var kafkaConnectDescriptor = KAFKA_BROKER_IP;
 
console.log("Running Module " + APP_NAME + " version " + APP_VERSION);

//initializeKafkaProducer
function initializeKafkaProducer(attempt) {
    try {
        console.log(`Try to initialize Kafka Client at ${kafkaConnectDescriptor} and Producer, attempt ${attempt}`);
        const client = new kafka.KafkaClient({ kafkaHost: kafkaConnectDescriptor });
        console.log("Created client");
        producer = new Producer(client);
        console.log("Submitted async producer creation request");
        producer.on('ready', function () {
            console.log("Producer is ready in " + APP_NAME);
        });
        producer.on('error', function (err) {
            console.log("Failed to create the client or the producer " + JSON.stringify(err));
        })
    } catch (e) {
        console.log("Exception in initializeKafkaProducer" + JSON.stringify(e));
        console.log("Try again in 5 seconds");
        setTimeout(initializeKafkaProducer, 5000, ++attempt);
    }
}

function publishEvent(eventKey, event) {
    km = new KeyedMessage(eventKey, JSON.stringify(event));
    payloads = [
        { topic: TOPIC_NAME, messages: [km], partition: 0 }
    ];
    producer.send(payloads, function (err, data) {
        if (err) {
            console.error("Failed to publish event with key " + eventKey + " to topic " + TOPIC_NAME + " :" + JSON.stringify(err));
        }
        console.log("Published event with key " + eventKey + " to topic " + TOPIC_NAME + " :" + JSON.stringify(data));
    });
}

initializeKafkaProducer(KAFKA_RETRY_ATTEMPTS);

var eventPublisher = module.exports;

eventPublisher.run = function () {
  var countries = require(COUNTRY_JSON_DATA_FILE)
      countries.forEach( function(node){
          var country_url = LONELY_PLANET_BASE_URL + node.country.replace(/ /g,"-").toLowerCase();
          publishEvent("countries-producer-key", {"country": node.country, "country_url": country_url})
      });
}