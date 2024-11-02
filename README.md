# Deprecated

I am moving away from Node-RED, so I won't be maintaining this package anymore. I am currently remaking (network) presence detection in a separate docker container that uses HomeAssistant's MQTT autodiscovery to connect the information with everything else: https://github.com/Cyberbeni/Wiring

# node-red-contrib-cb-arp

This node provides the content of the ARP table.<br>
It returns the mapping of the network address (IP address) to a physical address (MAC address) of the devices which are connected to the same LAN.

### Prerequisites

- Node.js v16 or later

### Install

From your node-red directory:

    npm install node-red-contrib-cb-arp

or

in the Node-red, Manage palette, Install node-red-contrib-cb-arp

### Usage

This node provides the content of the ARP table.

The output **msg.payload** is an array of objects containing : <br>

- ip : the IP address of the device.
- mac : the MAC address of the device.
- iface : the network interface of the device.

It is possible to filter the results by IP address :<br>

- in the node configuration, by providing IP address (separated by commas if multiple).
- in the input **msg.payload.ips** message string, by providing IP address (separated by commas if multiple).

### License 

MIT License
