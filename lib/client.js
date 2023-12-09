'use strict';
const mqtt = require('mqtt');

function MQTTClient(adapter) {
	if (!(this instanceof MQTTClient)) return new MQTTClient(adapter);

	let client = null;
	let connected = false;

	this.destroy = () => {
		if (client) {
			client.end();
			client = null;
		}
	};

	this.onStateChange = (id, state, cn) => send2Server(id, state, cn);

	function send2Server(id, state, cn) {
		if (!client) return;
		switch (cn) {

		}
	};

	(function _constructor(config) {
		const clientId = 'frigate';
		const _url = 'mqtt://' + config.mqtturl + (config.mqttport ? (':' + config.mqttport) : '') + '?clientId=' + clientId;
		adapter.log.info('Try to connect to ' + _url);
		client = mqtt.connect(_url, {
			keepalive: 10, /* in seconds */
			protocolId: 'MQTT',
			protocolVersion: 4,
			reconnectPeriod: 1000, /* in milliseconds */
			connectTimeout: (30) * 1000, /* in milliseconds */
		});

		client.subscribe('frigate/#');

		// create connected object and state
		adapter.getObject('info.connection', (err, obj) => {
			if (!obj || !obj.common || obj.common.type !== 'boolean') {
				obj = {
					_id: 'info.connection',
					type: 'state',
					common: {
						role: 'indicator.connected',
						name: 'If connected to MQTT broker',
						type: 'boolean',
						read: true,
						write: false,
						def: false
					},
					native: {}
				};
				adapter.setObject('info.connection', obj, () => adapter.setState('info.connection', connected, true));
			}
		});

		// topic from MQTT broker received
		client.on('message', (topic, message) => {
			if (!topic) return;

		});

		client.on('connect', () => {
			adapter.log.info('Connected to ' + config.mqtturl);
			connected = true;
			adapter.setState('info.connection', connected, true);
		});

		client.on('error', err => {
			adapter.log.error('Client error:' + err);

			if (connected) {
				adapter.log.info('Disconnected from ' + config.mqtturl);
				connected = false;
				adapter.setState('info.connection', connected, true);
			}
		});

		client.on('close', err => {
			if (connected) {
				adapter.log.info('Disconnected from ' + config.mqtturl);
				connected = false;
				adapter.setState('info.connection', connected, true);
			}
		});
	})(adapter.config);

	process.on('uncaughtException', err => adapter.log.error('uncaughtException: ' + err));

	return this;
}

module.exports = MQTTClient;