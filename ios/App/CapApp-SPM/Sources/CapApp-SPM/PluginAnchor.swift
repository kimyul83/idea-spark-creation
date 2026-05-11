import Foundation

// Swift dead-code elimination 방지 — SPM 모듈 안 Capacitor plugin 이 외부 참조 없으면
// 컴파일러가 binary 에서 제거함. AppDelegate 가 ensureRegistered() 한 번 호출하면
// 안의 [AnyClass] 배열이 평가되며 plugin 클래스들이 ObjC runtime 에 강제 등록됨.
@objc public final class CapAppSPMPlugins: NSObject {
    @objc public static let allPlugins: [AnyClass] = [
        NativeAudioPlugin.self,
        NowPlayingPlugin.self,
    ]

    @objc public static func ensureRegistered() {
        // allPlugins 참조만으로 strict evaluation 보장 → dead-code elim 차단
        _ = allPlugins.count
        print("[CapAppSPMPlugins] ensureRegistered — \(allPlugins.count) plugins anchored")
    }
}
