use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    program::invoke,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};
use spl_token::{
    instruction::mint_to,
    ID as TOKEN_PROGRAM_ID,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let mint_account = next_account_info(account_info_iter)?;
    let token_account = next_account_info(account_info_iter)?;
    let mint_authority = next_account_info(account_info_iter)?;
    let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
    let token_program = next_account_info(account_info_iter)?;

    let mint_to_instruction = mint_to(
        token_program.key,
        mint_account.key,
        token_account.key,
        mint_authority.key,
        &[],
        1,
    )?;

    msg!("Minting NFT to {}", token_account.key);
    invoke(
        &mint_to_instruction,
        &[
            mint_account.clone(),
            token_account.clone(),
            mint_authority.clone(),
            token_program.clone(),
        ],
    )?;

    Ok(())
}