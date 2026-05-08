import Foundation
import Capacitor
import MediaPlayer
import AVFoundation

/**
 * NowPlayingPlugin — iOS 잠금화면 / 제어센터에 미디어 위젯 표시.
 * Web MediaSession API 가 WKWebView 에선 안 통하므로 직접 MPNowPlayingInfoCenter 호출.
 *
 * JS 사용:
 *   import { Plugins } from '@capacitor/core';
 *   await (Capacitor.Plugins as any).NowPlaying.setInfo({ title, artist, album });
 *   await (Capacitor.Plugins as any).NowPlaying.setPlaybackState({ playing: true });
 */
@objc(NowPlayingPlugin)
public class NowPlayingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NowPlayingPlugin"
    public let jsName = "NowPlaying"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setInfo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setPlaybackState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise),
    ]

    private var commandsConfigured = false

    @objc func setInfo(_ call: CAPPluginCall) {
        let title = call.getString("title") ?? "Mint Wave"
        let artist = call.getString("artist") ?? "Mint Wave"
        let album = call.getString("album") ?? ""

        var info: [String: Any] = [:]
        info[MPMediaItemPropertyTitle] = title
        info[MPMediaItemPropertyArtist] = artist
        if !album.isEmpty {
            info[MPMediaItemPropertyAlbumTitle] = album
        }
        info[MPNowPlayingInfoPropertyPlaybackRate] = 1.0
        // 무한 루프 — 진행률 시뮬레이션 (12 시간으로 표시)
        info[MPMediaItemPropertyPlaybackDuration] = 12 * 60 * 60
        info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = 0

        MPNowPlayingInfoCenter.default().nowPlayingInfo = info

        // Remote commands — 한 번만 등록 (잠금화면 ▶/⏸ 버튼)
        if !commandsConfigured {
            configureRemoteCommands()
            commandsConfigured = true
        }

        call.resolve()
    }

    @objc func setPlaybackState(_ call: CAPPluginCall) {
        let playing = call.getBool("playing") ?? false
        var info = MPNowPlayingInfoCenter.default().nowPlayingInfo ?? [:]
        info[MPNowPlayingInfoPropertyPlaybackRate] = playing ? 1.0 : 0.0
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
        call.resolve()
    }

    @objc func clear(_ call: CAPPluginCall) {
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
        call.resolve()
    }

    private func configureRemoteCommands() {
        let cc = MPRemoteCommandCenter.shared()
        cc.playCommand.isEnabled = true
        cc.playCommand.addTarget { [weak self] _ in
            self?.notifyListeners("play", data: nil)
            return .success
        }
        cc.pauseCommand.isEnabled = true
        cc.pauseCommand.addTarget { [weak self] _ in
            self?.notifyListeners("pause", data: nil)
            return .success
        }
        // 트랙 변경 / 시간 점프 — 비활성 (음악 믹스 앱이라 의미 없음)
        cc.nextTrackCommand.isEnabled = false
        cc.previousTrackCommand.isEnabled = false
        cc.changePlaybackPositionCommand.isEnabled = false
    }
}
