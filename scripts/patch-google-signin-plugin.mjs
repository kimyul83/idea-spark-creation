#!/usr/bin/env node
// 🚨 절대 단순화 X — 민트클로젯에서 4번 깨졌다가 4번 복구된 패턴 그대로.
// @capawesome/capacitor-google-sign-in 의 기본 SDK 가 v8 인데
// v8 은 nonce 파라미터를 노출 안 함. v9 로 올리고 swift 시그니처에 nonce 추가.
// nonce 없으면 Supabase 가 "Passed nonce and nonce in id_token should either both exist or not" 에러로 거절.
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const PLUGIN = path.join(REPO_ROOT, "node_modules/@capawesome/capacitor-google-sign-in");

if (!fs.existsSync(PLUGIN)) {
  console.log("[patch-google-signin] plugin not installed, skipping");
  process.exit(0);
}

// 1) Package.swift → GoogleSignIn-iOS v9
const pkgPath = path.join(PLUGIN, "Package.swift");
let pkg = fs.readFileSync(pkgPath, "utf8");
pkg = pkg.replace(/\.upToNextMajor\(from:\s*"8\.\d+\.\d+"\)/, '.upToNextMajor(from: "9.0.0")');
fs.writeFileSync(pkgPath, pkg);

// 2) GoogleSignIn.swift → signIn 에 nonce 파라미터 + GIDSignIn 호출 nonce 전달
const swiftPath = path.join(PLUGIN, "ios/Plugin/GoogleSignIn.swift");
let swift = fs.readFileSync(swiftPath, "utf8");
swift = swift.replace(
  /@objc public func signIn\(completion: @escaping \(_ result: SignInResult\?, _ error: Error\?\) -> Void\)/,
  "@objc public func signIn(nonce: String? = nil, completion: @escaping (_ result: SignInResult?, _ error: Error?) -> Void)",
);
swift = swift.replace(
  /GIDSignIn\.sharedInstance\.signIn\(withPresenting: viewController, hint: nil, additionalScopes: scopes, completion: signInCompletion\)/,
  "GIDSignIn.sharedInstance.signIn(withPresenting: viewController, hint: nil, additionalScopes: scopes, nonce: nonce, completion: signInCompletion)",
);
swift = swift.replace(
  /GIDSignIn\.sharedInstance\.signIn\(withPresenting: viewController, completion: signInCompletion\)/,
  "GIDSignIn.sharedInstance.signIn(withPresenting: viewController, hint: nil, additionalScopes: nil, nonce: nonce, completion: signInCompletion)",
);
fs.writeFileSync(swiftPath, swift);

// 3) GoogleSignInPlugin.swift → JS call 에서 nonce 읽어서 implementation 에 전달
const pluginPath = path.join(PLUGIN, "ios/Plugin/GoogleSignInPlugin.swift");
let plugin = fs.readFileSync(pluginPath, "utf8");
plugin = plugin.replace(
  /@objc func signIn\(_ call: CAPPluginCall\) \{\s*implementation\?\.signIn\(completion:/,
  '@objc func signIn(_ call: CAPPluginCall) {\n        let nonce = call.getString("nonce")\n        implementation?.signIn(nonce: nonce, completion:',
);
fs.writeFileSync(pluginPath, plugin);

console.log("[patch-google-signin] done");
