'use strict';

const { EventEmitter } = require('node:events');
const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

class MockAdapter extends EventEmitter {
    constructor() {
        super();
        this.namespace = 'pixelit.0';
        this.config = { ip: '192.0.2.1' };
        this.log = { debug: sinon.stub(), info: sinon.stub(), warn: sinon.stub(), error: sinon.stub() };
        this.setStateChangedAsync = sinon.stub().resolves();
        this.setObjectNotExistsAsync = sinon.stub().resolves();
        this.subscribeStates = sinon.stub();
    }
}

describe('PixelIt commands', () => {
    let adapter;
    let http;

    beforeEach(async () => {
        http = { post: sinon.stub().resolves(), get: sinon.stub().resolves({ data: { id: 0 } }) };
        const createAdapter = proxyquire('./main', {
            '@iobroker/adapter-core': { Adapter: MockAdapter },
            axios: http,
        });
        adapter = createAdapter();
        adapter.initWebsocket = sinon.stub();
        await adapter.onReady();
        adapter.setStateChangedAsync.resetHistory();
    });

    it('sends show_clock with the supported empty clock payload', async () => {
        await adapter.onStateChange('pixelit.0.show_clock', { val: true, ack: false });
        expect(http.post.firstCall.args[0]).to.equal('http://192.0.2.1/api/screen');
        expect(http.post.firstCall.args[1]).to.deep.equal({ clock: {} });
        expect(adapter.setStateChangedAsync.calledWith('pixelit.0.show_clock', true, true)).to.equal(true);
    });

    it('maps percentage brightness to the device range', async () => {
        await adapter.onStateChange('pixelit.0.brightness', { val: 50, ack: false });
        expect(http.post.firstCall.args[1]).to.deep.equal({ brightness: 128 });
    });

    it('keeps raw brightness in the device range', async () => {
        await adapter.onStateChange('pixelit.0.brightness_255', { val: 200, ack: false });
        expect(http.post.firstCall.args[1]).to.deep.equal({ brightness: 200 });
    });

    it('synchronizes acknowledged brightness without another device request', async () => {
        await adapter.onStateChange('pixelit.0.brightness_255', { val: 128, ack: true });
        expect(adapter.setStateChangedAsync.calledWith('pixelit.0.brightness', 50, true)).to.equal(true);
        expect(http.post.called).to.equal(false);
    });

    it('ignores deleted brightness states', async () => {
        await adapter.onStateChange('pixelit.0.brightness', null);
        expect(http.post.called).to.equal(false);
        expect(adapter.setStateChangedAsync.called).to.equal(false);
    });

    it('ignores unrelated states', async () => {
        await adapter.onStateChange('pixelit.0.unknown', { val: true, ack: false });
        expect(http.post.called).to.equal(false);
    });

    it('sends a plain text message', async () => {
        await adapter.onStateChange('pixelit.0.message', { val: 'Hello', ack: false });
        const { text } = http.post.firstCall.args[1];
        expect(text.textString).to.equal('Hello');
        expect(text.position).to.deep.equal({ x: 0, y: 1 });
        expect(text.color).to.deep.equal({ r: 255, g: 255, b: 255 });
    });

    it('uses an 8 by 8 fallback icon when the gallery has no bitmap', async () => {
        await adapter.onStateChange('pixelit.0.message', { val: 'Hello;255,0,0;123', ack: false });
        const data = http.post.firstCall.args[1];
        expect(data.text.position).to.deep.equal({ x: 8, y: 1 });
        expect(data.bitmap.size).to.deep.equal({ width: 8, height: 8 });
    });

    it('resolves an extended bitmap ID to its pixel array', async () => {
        http.get.resolves({ data: { id: 123, sizeX: 1, sizeY: 1, animated: false, rgB565Array: '[42]' } });
        await adapter.onStateChange('pixelit.0.ext_message', {
            val: JSON.stringify({ bitmap: { data: 123 } }),
            ack: false,
        });
        expect(http.post.firstCall.args[1].bitmap.data).to.deep.equal([42]);
    });

    it('resolves an extended animation ID to its frames', async () => {
        http.get.resolves({ data: { id: 123, sizeX: 1, sizeY: 1, animated: true, rgB565Array: '[42],[43]' } });
        await adapter.onStateChange('pixelit.0.ext_message', {
            val: JSON.stringify({ bitmapAnimation: { data: 123 } }),
            ack: false,
        });
        expect(http.post.firstCall.args[1].bitmapAnimation.data).to.deep.equal([[42], [43]]);
    });

    it('rejects malformed extended JSON without a request', async () => {
        await adapter.onStateChange('pixelit.0.ext_message', { val: '{', ack: false });
        expect(http.post.called).to.equal(false);
        expect(adapter.log.warn.calledOnce).to.equal(true);
    });

    it('does not acknowledge commands after a failed device request', async () => {
        http.post.rejects(new Error('offline'));
        await adapter.onStateChange('pixelit.0.sleep_mode', { val: true, ack: false });
        expect(adapter.setStateChangedAsync.called).to.equal(false);
    });
});
