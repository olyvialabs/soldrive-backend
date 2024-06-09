use sha2::{Digest, Sha256};

fn get_discriminator(name: &str) -> [u8; 8] {
    let mut hasher = Sha256::new();
    hasher.update(name.as_bytes());
    let result = hasher.finalize();
    let mut discriminator = [0u8; 8];
    discriminator.copy_from_slice(&result[..8]);
    discriminator
}

fn main() {
    let init_discriminator = get_discriminator("initialize");
    let deposit_discriminator = get_discriminator("deposit");
    let withdraw_discriminator = get_discriminator("withdraw");

    println!("Initialize Discriminator: {:?}", init_discriminator);
    println!("Deposit Discriminator: {:?}", deposit_discriminator);
    println!("Withdraw Discriminator: {:?}", withdraw_discriminator);
}
