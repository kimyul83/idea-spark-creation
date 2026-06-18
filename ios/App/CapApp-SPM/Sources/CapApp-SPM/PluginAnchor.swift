import Foundation

// SPM 모듈 안 Capacitor plugin 강제 anchor — Swift dead-code elimination 방지.
//
// 핵심 트릭: 인스턴스를 static let 으로 만들면 컴파일러가 절대 elim 못 함.
// 인스턴스가 만들어진다는 건 = 클래스가 ObjC runtime 에 등록되어 있다는 것.
// Capacitor 의 enumeration 이 그 클래스를 발견 가능.
@objc public final class CapAppSPMPlugins: NSObject {
    // 인스턴스 자체를 anchor — 클래스 link 100% 보장
    // NativeAudio anchor 제거 — capacitor:// 스킴 URLSession 다운로드 실패로 깨진 데이터 재생 (사용자 보고: "기계음").
    // plugin 등록 안 되면 audio-adapter.ts 의 registerPlugin 이 null 리턴 → Howler html5 폴백 (깨끗한 재생).
    // 잠금화면 미디어 컨트롤은 NowPlaying 만으로 유지됨.
    private static let _nowPlayingInstance = NowPlayingPlugin()

    @objc public static func ensureRegistered() {
        _ = _nowPlayingInstance
        print("[CapAppSPMPlugins] ensureRegistered — NowPlaying only (NativeAudio disabled)")
    }
}
