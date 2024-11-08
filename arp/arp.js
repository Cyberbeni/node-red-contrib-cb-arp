module.exports = function(RED) {
	"use strict";
	
	const os = require("os");
	const exec = require("child_process").exec;

	const macMatcher = /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/;
	
	function PromiseFunc() {
		this.execCommand = function(cmd) {
			return new Promise(function(resolve, reject) {
				exec(cmd, function(error, stdout, stderr) {
					if (error) {
						reject(error);
						return;
					}
					resolve(stdout)
				});
			});
		}
	};

	function ARP(config) {
		RED.nodes.createNode(this, config);
		let node = this
		let ipConfig = config.ips

		node.on("input", function(msg) {
			if (msg && msg.payload) {
				node.status({ fill: "yellow", shape: "dot", text: "running" });

				ipConfig = msg.payload.ips || ipConfig
				const ips = ipConfig ? ipConfig.split(",") : undefined

				if (ips) {
					let ping = `echo -n ${ips.join(" ")} | tr " " "\n" | xargs -n1 -P255 ping -W 1 -c 1`
					exec(ping);
				} else {
					const interfaces = os.networkInterfaces()
					Object.keys(interfaces).forEach(function(inter) {
						interfaces[inter].forEach(function(details) {
							if (!details.internal && details.family === "IPv4") {
								let prefix = details.address.substring(0, details.address.lastIndexOf(".") + 1)
								let ping = `echo -n ${Array.from({length: 254}, (_, i) => `${prefix}${i + 1}`).join(" ")} | tr " " "\n" | xargs -n1 -P255 ping -W 1 -c 1`;
								exec(ping);
							}
						});
					});
				}
				
				const execF = new PromiseFunc();
				execF.execCommand("arp -n").then(function(res) {
					node.status({ fill: "green", shape: "dot", text: "finished" });

					if (res && res.length) {
						const arpEntries = [];
						const lines = res.split("\n");

						for (const line of lines) {
							if (!macMatcher.test(line)) continue;
							
							const cols = line.split(" ");
							let ip = "";
							let mac = "";
							let iface = "";

							for (const col of cols) {
								if (col.includes(".")) {
									ip = col.replaceAll(/[()]/g, "");
									continue;
								}
								if (col.includes(":")) {
									mac = col;
									continue;
								}
								if (cols.indexOf(col) === cols.length - 1) {
									iface = col;
									continue;
								}
							}

							if (ip.length) {
								const arpEntry = { ip, mac, iface };

								if (ips) {
									if (ips.includes(ip)) {
										arpEntries.push(arpEntry);
									}
								} else {
									arpEntries.push(arpEntry);
								}
							}
						}
						msg.payload = arpEntries;
						return node.send(msg);
					}
				}).catch(function(err) {
					node.status({ fill: "red", shape: "dot", text: "error" });
					node.error(err);
					msg.payload.error = err;
					return node.send(msg);
				});
			}
		});

	}
	RED.nodes.registerType("arp", ARP);
};
