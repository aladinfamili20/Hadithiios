platform :ios, '15.1'
prepare_react_native_project!

linkage = ENV['USE_FRAMEWORKS']
if linkage != nil
  Pod::UI.puts "Configuring Pod with #{linkage}ally linked Frameworks".green
  use_frameworks! :linkage => linkage.to_sym
else
  use_frameworks! :linkage => :static
end

target 'HadithiSocial' do
  config = use_native_modules!

  # ✅ Firebase pods with modular headers
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseAuth', :modular_headers => true
  pod 'FirebaseFirestore', :modular_headers => true
  pod 'FirebaseStorage', :modular_headers => true

  # ✅ Support pods with modular headers
  pod 'GoogleUtilities', :modular_headers => true
  pod 'FirebaseCoreExtension', :modular_headers => true
  pod 'FirebaseAuthInterop', :modular_headers => true
  pod 'FirebaseAppCheckInterop', :modular_headers => true
  pod 'RecaptchaInterop', :modular_headers => true
  pod 'FirebaseFirestoreInternal', :modular_headers => true

  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )

    # ✅ Force CLANG modules
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
        config.build_settings['DEAD_CODE_STRIPPING'] = 'YES'
      end
    end
  end
end
