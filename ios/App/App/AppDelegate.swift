import UIKit
import Capacitor
import AVFoundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 백그라운드 오디오 활성화 — 화면 꺼도, 다른 앱 가도, 12시간까지 재생 유지.
        // .playback = 미디어 재생 의도 (음소거 스위치도 무시)
        // .mixWithOthers = 다른 앱 (전화 등) 과 같이 재생 가능
        // .allowAirPlay = AirPlay 지원
        do {
            try AVAudioSession.sharedInstance().setCategory(
                .playback,
                mode: .default,
                options: [.allowAirPlay, .allowBluetooth, .allowBluetoothA2DP]
            )
            try AVAudioSession.sharedInstance().setActive(true)
            print("[Mint Wave] AVAudioSession 백그라운드 재생 활성화")
        } catch {
            print("[Mint Wave] AVAudioSession 설정 실패: \(error)")
        }
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // 앱 재활성화 시 AVAudioSession 다시 활성화 — 백그라운드에서 deactivate 됐을 때 대응
        do {
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("[Mint Wave] AVAudioSession 재활성화 실패: \(error)")
        }
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // 백그라운드 → 포그라운드 전환 시도 audio session 보장
        do {
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("[Mint Wave] AVAudioSession 활성화 실패 (foreground): \(error)")
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
