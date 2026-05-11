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
        // IsLiveStream = true → 잠금화면 진행 막대 숨김.
        // 이유: iOS WKWebView 의 HTMLAudioElement 가 파일 실제 길이(1~3분)로 자동 덮어써서
        // 우리가 12시간 설정해도 즉시 무시됨. 진행 막대 안 보이는 게 더 깔끔.
        // 시간 정보는 title/artist/album 에 텍스트로 직접 박음 (앱 측에서).
        info[MPNowPlayingInfoPropertyIsLiveStream] = true

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
        // 1) 재생 상태 stopped 마킹 → 위젯이 paused 상태로 남는 거 방지
        var info = MPNowPlayingInfoCenter.default().nowPlayingInfo ?? [:]
        info[MPNowPlayingInfoPropertyPlaybackRate] = 0.0
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
        // 2) 정보 nil — 잠금화면 위젯 정보 제거
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
        // 3) AVAudioSession deactivate — session active 면 위젯이 그대로 anchored 됨
        //    .notifyOthersOnDeactivation → 다른 음악 앱에 양보 (예의)
        do {
            try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        } catch {
            print("[NowPlaying] audio session deactivate 실패: \(error)")
        }
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
