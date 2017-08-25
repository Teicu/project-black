import _ from 'lodash'
import React from 'react'

import HostsListHead from '../presentational/HostsListHead.jsx'
import Tasks from '../../common/tasks/Tasks.jsx'
import HostsTableTracked from './HostsTableTracked.jsx'
import TasksButtonsTracked from './TasksButtonsTracked.jsx'



class HostsList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			regexesObjects: {

			}
		};

		this.filter = this.filter.bind(this);
		this.reworkHostsList = this.reworkHostsList.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return ((JSON.stringify(nextProps) !== JSON.stringify(this.props)) || ((JSON.stringify(nextState) !== JSON.stringify(this.state)));
	}

	filter(data, name) {
		if (data) {
			// Work only on hosts (hostname filter + banner filter)
			var data_copy = JSON.parse(JSON.stringify(data));
			var hosts = [];
			var noFilter = true;

			if (this.state.regexesObjects.hasOwnProperty('host')) {
				if (noFilter) {
					hosts = data_copy;
				}
				noFilter = false;

				var hostsRegex = this.state.regexesObjects['host'];
				var newHosts = data_copy.filter((x) => {
					return hostsRegex.test(x['hostname']);
				});

				hosts = newHosts;
			}

			if (this.state.regexesObjects.hasOwnProperty('ip')) {
				if (noFilter) {
					hosts = data_copy;
				}				
				noFilter = false;

				var ipRegex = this.state.regexesObjects['ip'];
				for (var host of hosts) {
					host['ip_addresses'] = host['ip_addresses'].filter((x) => {
						return ipRegex.test(x['ip_address']);
					});
				}

				hosts = hosts.filter((x) => {
					return x.ip_addresses.length > 0;
				});
			}

			if (this.state.regexesObjects.hasOwnProperty('banner')) {
				if (noFilter) {
					hosts = data_copy;
				}

				noFilter = false;
				var bannerRegex = this.state.regexesObjects['banner'];
				for (var host of hosts) {
					for (var ip_address of host['ip_addresses']) {
						ip_address['scans'] = ip_address['scans'].filter((x) => {
							return bannerRegex.test(x['banner']);
						});
					}

					host['ip_addresses'] = host['ip_addresses'].filter((x) => {
						return x.scans.length > 0;
					});
				}

				hosts = hosts.filter((x) => {
					return x.ip_addresses.length > 0;
				});
			}

			if (this.state.regexesObjects.hasOwnProperty('port')) {
				if (noFilter) {
					hosts = data_copy;
				}

				noFilter = false;
				var portRegex = this.state.regexesObjects['port'];
				for (var host of hosts) {
					for (var ip_address of host['ip_addresses']) {
						ip_address['scans'] = ip_address['scans'].filter((x) => {
							return portRegex.test(String(x['port_number']));
						});
					}

					host['ip_addresses'] = host['ip_addresses'].filter((x) => {
						return x.scans.length > 0;
					});

				}
				hosts = hosts.filter((x) => {
					return x.ip_addresses.length > 0;
				});
			}

			if (this.state.regexesObjects.hasOwnProperty('port')) {
				if (noFilter) {
					hosts = data_copy;
				}

				noFilter = false;
				var portRegex = this.state.regexesObjects['port'];
				for (var host of hosts) {
					for (var ip_address of host['ip_addresses']) {
						ip_address['scans'] = ip_address['scans'].filter((x) => {
							return portRegex.test(String(x['port_number']));
						});
					}

					host['ip_addresses'] = host['ip_addresses'].filter((x) => {
						return x.scans.length > 0;
					});

				}

				hosts = hosts.filter((x) => {
					return x.ip_addresses.length > 0;
				});
			}

			if (noFilter) {
				return data_copy
			}
			else {
				return hosts
			}
		}
		else {
			return []
		}
	}

	componentWillReceiveProps(newProps, newState) {
		const newFilters = newProps['filters'];

		if (newFilters === null) {
			this.setState({
				regexesObjects: {}
			});		
		}
		else {
			var newRegexObjects = {};

			for (var eachKey of Object.keys(newFilters)) {
				newRegexObjects[eachKey] = new RegExp(newFilters[eachKey]);
			}

			this.setState({
				regexesObjects: newRegexObjects
			});			
		}

	}

	reworkHostsList(hosts_input, scans) {
		var hosts = JSON.parse(JSON.stringify(hosts_input));

	    for (var each_host of hosts) {
			for (var ip_index = 0; ip_index < each_host.ip_addresses.length; ip_index++) {
				let ip_address = each_host.ip_addresses[ip_index];
				let filtered_scans = scans.filter((x) => {
					return x.target === ip_address;
				});

				each_host.ip_addresses[ip_index] = {
					'ip_address': ip_address,
					'scans': filtered_scans
				};
			}    	
	    }

	    return hosts
	}

	render() {
		const scopes = this.reworkHostsList(this.props.scopes.hosts, this.props.scans);
		const filtered_scopes = this.filter(scopes);
		

		return (
			<div>
				<HostsListHead />
				<Tasks tasks={this.props.tasks} />

				<hr />

				<TasksButtonsTracked scopes={filtered_scopes}
									 scans={this.props.scans} 
									 project={this.props.project} />

				<HostsTableTracked project={this.props.project}
								   scopes={filtered_scopes}
								   onFilterChange={this.props.onFilterChangeHosts}

								   scans={this.props.scans} />
			</div>
		)
	}
}

export default HostsList;
