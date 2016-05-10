'use strict'

const url  = require('url')
const http = require('http')
const qs   = require('querystring')
const sink = require('stream-sink')
const noop = () => {}



const tracker = (opt = {}) => {
	if ('string' !== typeof opt.host) throw new Error('Missing host.')
	if ('number' !== typeof opt.port) throw new Error('Missing port.')
	if ('string' !== typeof opt.tracker) throw new Error('Missing tracker.')
	if ('string' !== typeof opt.key) throw new Error('Missing key.')
	return (cb = noop) => {
		let req = http.request({
			  method: 'PATCH'
			, host:   opt.host
			, port:   opt.port
			, path:   '/trackers/' + encodeURIComponent(opt.tracker)
			, headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})
		req.on('error', cb)
		req.on('response', (res) => {
			if (200 <= res.statusCode && res.statusCode < 300) return cb()
			res.pipe(sink()).on('data', (body) => {
				try {body = JSON.parse(body)}
				catch (e) {cb(new Error('Invalid response.'))}
				cb(new Error(body.msg))
			})
		})
		req.end(qs.stringify({key: opt.key}))
	}
}

module.exports = tracker
