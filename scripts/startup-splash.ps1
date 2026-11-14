function New-StartupSplash {
    param([string]$ProjectRoot)
    Add-Type -AssemblyName PresentationFramework
    [xml]$xaml = @'
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" Width="560" Height="420" WindowStyle="None" ResizeMode="NoResize" WindowStartupLocation="CenterScreen" Background="#F6F7F0" ShowInTaskbar="True" Title="Meal Planner · Spouštění">
 <Border Background="#F6F7F0" BorderBrush="#DDE3D6" BorderThickness="1" Padding="48,38">
  <Grid>
   <Grid.RowDefinitions><RowDefinition Height="*"/><RowDefinition Height="Auto"/></Grid.RowDefinitions>
   <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center">
    <Border Width="88" Height="88" Background="#365A40" CornerRadius="24" Margin="0,0,0,24">
     <Grid><TextBlock x:Name="BrandMark" Text="◒" FontSize="60" Foreground="#F6F7F0" HorizontalAlignment="Center" VerticalAlignment="Center"/><Image x:Name="BrandLogo" Visibility="Collapsed" Stretch="Uniform" Margin="10"/></Grid>
    </Border>
    <TextBlock Text="VÁŠ PROSTOR. VAŠE TEMPO." FontFamily="Segoe UI" FontSize="10" FontWeight="SemiBold" Foreground="#6B7868" HorizontalAlignment="Center" Margin="0,0,0,12"/>
    <TextBlock x:Name="BrandName" Text="Meal Planner" FontFamily="Segoe UI" FontSize="32" FontWeight="SemiBold" Foreground="#233C2B" TextAlignment="Center" TextWrapping="Wrap" MaxWidth="450"/>
    <TextBlock Text="Dobrý den začíná dobrým plánem." FontFamily="Segoe UI" FontSize="13" Foreground="#6B7868" Margin="0,10,0,30" HorizontalAlignment="Center"/>
   </StackPanel>
   <StackPanel Grid.Row="1"><ProgressBar IsIndeterminate="True" Height="3" Foreground="#6C8B59" Background="#E3E9DB" BorderThickness="0"/><TextBlock x:Name="StartupStatus" Text="Připravujeme váš prostor…" FontFamily="Segoe UI" FontSize="11" Foreground="#6B7868" Margin="0,15,0,0" HorizontalAlignment="Center"/></StackPanel>
  </Grid>
 </Border>
</Window>
'@
    $window = [Windows.Markup.XamlReader]::Load([Xml.XmlNodeReader]::new($xaml))
    $brandingRoot = Join-Path $ProjectRoot '.local-data/branding'
    $configPath = Join-Path $brandingRoot 'brand.json'
    if (Test-Path -LiteralPath $configPath) {
        try {
            $brand = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json
            if ($brand.name) { $window.FindName('BrandName').Text = $brand.name }
            if ($brand.logo -in @('logo.png', 'logo.jpg')) {
                $logoPath = Join-Path $brandingRoot $brand.logo
                if (Test-Path -LiteralPath $logoPath) {
                    $bitmap = [Windows.Media.Imaging.BitmapImage]::new()
                    $bitmap.BeginInit()
                    $bitmap.CacheOption = [Windows.Media.Imaging.BitmapCacheOption]::OnLoad
                    $bitmap.UriSource = [Uri]::new($logoPath)
                    $bitmap.EndInit()
                    $window.FindName('BrandLogo').Source = $bitmap
                    $window.FindName('BrandLogo').Visibility = 'Visible'
                    $window.FindName('BrandMark').Visibility = 'Collapsed'
                }
            }
        } catch { # Optional branding must never prevent startup.
        }
    }
    return $window
}
