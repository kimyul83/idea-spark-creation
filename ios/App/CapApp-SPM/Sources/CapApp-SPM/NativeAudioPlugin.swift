import Foundation
import Capacitor
import AVFoundation

/**
 * NativeAudioPlugin — AVAudioPlayer 기반 멀티트랙 오디오.
 * Howler.js (HTMLAudioElement) 대체 → iOS 잠금화면 자동 메타데이터 충돌 제거.
 *
 * JS 사용:
 *   await Capacitor.Plugins.NativeAudio.play({ id: 'waterfall', url: 'https://...', volume: 0.45, loop: true });
 *   await Capacitor.Plugins.NativeAudio.setVolume({ id: 'waterfall', volume: 0.6 });
 *   await Capacitor.Plugins.NativeAudio.stop({ id: 'waterfall' });
 *   await Capacitor.Plugins.NativeAudio.stopAll();
 */
@objc(NativeAudioPlugin)
public class NativeAudioPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeAudioPlugin"
    public let jsName = "NativeAudio"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "play", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopAll", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setVolume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isPlaying", returnType: CAPPluginReturnPromise),
    ]

    private var players: [String: AVAudioPlayer] = [:]
    private let queue = DispatchQueue(label: "com.mintwave.nativeaudio")

    override public func load() {
        print("[NativeAudio] ✅ plugin loaded as 'NativeAudio'")
    }

    @objc func play(_ call: CAPPluginCall) {
        guard let id = call.getString("id"),
              let urlString = call.getString("url"),
              let url = URL(string: urlString) else {
            call.reject("id 와 url 필수")
            return
        }
        let volume = call.getFloat("volume") ?? 0.5
        let loop = call.getBool("loop") ?? true
        print("[NativeAudio] ▶ play: id=\(id) url=\(urlString) vol=\(volume) loop=\(loop)")

        queue.async { [weak self] in
            guard let self = self else { return }
            // 기존 인스턴스 정리
            if let old = self.players[id] {
                old.stop()
                self.players.removeValue(forKey: id)
            }

            // 원격 URL — async 다운로드 후 재생 (CDN mp3 처리)
            URLSession.shared.dataTask(with: url) { data, _, error in
                if let error = error {
                    call.reject("로드 실패: \(error.localizedDescription)")
                    return
                }
                guard let data = data else {
                    call.reject("데이터 없음")
                    return
                }
                self.queue.async {
                    do {
                        let player = try AVAudioPlayer(data: data)
                        player.numberOfLoops = loop ? -1 : 0  // -1 = infinite
                        player.volume = volume
                        player.prepareToPlay()
                        player.play()
                        self.players[id] = player
                        call.resolve()
                    } catch {
                        call.reject("재생 실패: \(error.localizedDescription)")
                    }
                }
            }.resume()
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else {
            call.reject("id 필수")
            return
        }
        queue.async { [weak self] in
            self?.players[id]?.stop()
            self?.players.removeValue(forKey: id)
            call.resolve()
        }
    }

    @objc func stopAll(_ call: CAPPluginCall) {
        queue.async { [weak self] in
            self?.players.values.forEach { $0.stop() }
            self?.players.removeAll()
            call.resolve()
        }
    }

    @objc func setVolume(_ call: CAPPluginCall) {
        guard let id = call.getString("id"),
              let vol = call.getFloat("volume") else {
            call.reject("id, volume 필수")
            return
        }
        queue.async { [weak self] in
            self?.players[id]?.volume = vol
            call.resolve()
        }
    }

    @objc func isPlaying(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else {
            call.reject("id 필수")
            return
        }
        let playing = players[id]?.isPlaying ?? false
        call.resolve(["playing": playing])
    }
}
