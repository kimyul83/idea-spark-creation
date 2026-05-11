import Foundation

// SPM 모듈 안 Capacitor plugin 강제 anchor — Swift dead-code elimination 방지.
//
// 핵심 트릭: 인스턴스를 static let 으로 만들면 컴파일러가 절대 elim 못 함.
// 인스턴스가 만들어진다는 건 = 클래스가 ObjC runtime 에 등록되어 있다는 것.
// Capacitor 의 enumeration 이 그 클래스를 발견 가능.
@objc public final class CapAppSPMPlugins: NSObject {
    // 인스턴스 자체를 anchor — 클래스 link 100% 보장
    private static let _nativeAudioInstance = NativeAudioPlugin()
    private static let _nowPlayingInstance = NowPlayingPlugin()

    @objc public static func ensureRegistered() {
        // static let 평가 강제 → 두 인스턴스 생성 → 두 클래스 ObjC runtime 등록
        _ = _nativeAudioInstance
        _ = _nowPlayingInstance
        print("[CapAppSPMPlugins] ensureRegistered — NativeAudio + NowPlaying anchored")
    }
}
